"""WitMotion WT9011DCL-BT50 BLE protocol: packet parsing and register commands.

Byte-level format cross-checked against the WitMotion BLE 5.0 protocol and two
community implementations (enthusiasticgeek/witmotion_python_wt9011dcl,
FreecityDong/WT9011DCL). Pure Python, no BLE dependency — bleak is only
needed by logger.py.

Data packet (default streaming output, 20 bytes):
    0x55 0x61  axL axH ayL ayH azL azH  wxL wxH wyL wyH wzL wzH
               rollL rollH pitchL pitchH yawL yawH
All values int16 little-endian. Scales: accel /32768*16 g,
gyro /32768*2000 deg/s, angle /32768*180 deg.

Register packets (single-read replies) use flag 0x71 and are surfaced as
RegisterReply so callers can verify configuration.
"""

from __future__ import annotations

import struct
from dataclasses import dataclass

# BLE GATT UUIDs — note WitMotion uses a nonstandard base (…9a34fb, not …9b34fb)
SERVICE_UUID = "0000ffe5-0000-1000-8000-00805f9a34fb"
NOTIFY_UUID = "0000ffe4-0000-1000-8000-00805f9a34fb"
WRITE_UUID = "0000ffe9-0000-1000-8000-00805f9a34fb"

PACKET_LEN = 20
HEADER = 0x55
FLAG_DATA = 0x61
FLAG_REGISTER = 0x71

G = 9.80665
SCALE_ACCEL = 16.0 / 32768.0 * G      # int16 -> m/s^2 (±16 g range)
SCALE_GYRO = 2000.0 / 32768.0         # int16 -> deg/s (±2000 deg/s range)
SCALE_ANGLE = 180.0 / 32768.0         # int16 -> deg

# Output-rate register (RRATE, 0x03) values.
# Datasheet default is 0x06 = 10 Hz, which is useless for the whip band.
RATE_REGISTER = 0x03
RATE_VALUES = {
    0.1: 0x01, 0.5: 0x02, 1: 0x03, 2: 0x04, 5: 0x05,
    10: 0x06, 20: 0x07, 50: 0x08, 100: 0x09, 200: 0x0B,
}

# Low-pass bandwidth register (0x1F). THE DEFAULT IS 20 Hz, and that is a trap:
# it sits inside our 2-25 Hz whip band, so the bar's own ring-down gets filtered
# before it ever reaches the radio. The datasheet also warns that when the
# output rate exceeds the bandwidth you get repeated samples ("two or more
# adjacent data are exactly the same") - 100 Hz output against a 20 Hz filter
# is exactly that case. FINDINGS section 9 specifies 188 Hz.
BANDWIDTH_REGISTER = 0x1F
BANDWIDTH_VALUES = {
    256: 0x00, 188: 0x01, 98: 0x02, 42: 0x03,
    20: 0x04, 10: 0x05, 5: 0x06,
}

# Attitude algorithm (0x24). 9-axis uses the magnetometer, which is meaningless
# on a steel bar with magnets glued to it; 6-axis integrates the gyro instead.
ALGORITHM_REGISTER = 0x24
ALGORITHM_9AXIS = 0x00
ALGORITHM_6AXIS = 0x01

# Output content (0x96). If this is ever set to 1 the module stops sending
# acceleration and angular velocity entirely and sends displacement instead,
# which would silently empty every channel we care about.
OUTPUT_CONTENT_REGISTER = 0x96
OUTPUT_ACCEL_GYRO_ANGLE = 0x00
OUTPUT_DISPLACEMENT = 0x01


@dataclass(frozen=True)
class Sample:
    """One streaming sample, in SI-ish units (m/s^2, deg/s, deg)."""
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float
    roll: float
    pitch: float
    yaw: float


@dataclass(frozen=True)
class RegisterReply:
    """A 0x71 single-read reply: starting register + four raw int16 values."""
    register: int
    values: tuple


def parse_data_payload(payload: bytes) -> Sample:
    """Parse the 18-byte payload of a 0x55 0x61 packet."""
    raw = struct.unpack("<9h", payload)
    return Sample(
        ax=raw[0] * SCALE_ACCEL,
        ay=raw[1] * SCALE_ACCEL,
        az=raw[2] * SCALE_ACCEL,
        gx=raw[3] * SCALE_GYRO,
        gy=raw[4] * SCALE_GYRO,
        gz=raw[5] * SCALE_GYRO,
        roll=raw[6] * SCALE_ANGLE,
        pitch=raw[7] * SCALE_ANGLE,
        yaw=raw[8] * SCALE_ANGLE,
    )


class PacketStream:
    """Incremental packet framer.

    BLE notifications don't have to align with packet boundaries, so feed()
    accepts arbitrary byte chunks, resynchronises on the 0x55 header, and
    returns whole parsed packets. Bytes skipped during resync are counted in
    .dropped_bytes — a nonzero count on a live stream means corruption or a
    framing bug and should be surfaced, never ignored.
    """

    def __init__(self):
        self._buf = bytearray()
        self.dropped_bytes = 0
        self.unknown_flags = 0

    def feed(self, chunk: bytes) -> list:
        self._buf.extend(chunk)
        out = []
        while True:
            start = self._buf.find(HEADER)
            if start < 0:
                self.dropped_bytes += len(self._buf)
                self._buf.clear()
                break
            if start > 0:
                self.dropped_bytes += start
                del self._buf[:start]
            if len(self._buf) < PACKET_LEN:
                break
            flag = self._buf[1]
            if flag == FLAG_DATA:
                out.append(parse_data_payload(bytes(self._buf[2:PACKET_LEN])))
                del self._buf[:PACKET_LEN]
            elif flag == FLAG_REGISTER:
                reg = self._buf[2]
                values = struct.unpack("<4h", bytes(self._buf[4:12]))
                out.append(RegisterReply(register=reg, values=values))
                del self._buf[:PACKET_LEN]
            else:
                # Not a packet start we recognise — drop one byte and resync.
                self.unknown_flags += 1
                self.dropped_bytes += 1
                del self._buf[:1]
        return out


# --- register commands (write to WRITE_UUID) ---------------------------------

def write_register_command(register: int, value: int) -> bytes:
    """FF AA <reg> <valueL> <valueH>"""
    return bytes([0xFF, 0xAA, register, value & 0xFF, (value >> 8) & 0xFF])


def read_register_command(register: int) -> bytes:
    """FF AA 27 <reg> 00 — reply arrives as a 0x71 packet."""
    return bytes([0xFF, 0xAA, 0x27, register, 0x00])


def unlock_command() -> bytes:
    return write_register_command(0x69, 0xB588)


def save_command() -> bytes:
    return write_register_command(0x00, 0x0000)


def set_rate_commands(rate_hz) -> list:
    """Full sequence to change output rate: unlock, write RRATE, save."""
    value = RATE_VALUES[rate_hz]
    return [
        unlock_command(),
        write_register_command(RATE_REGISTER, value),
        save_command(),
    ]


def set_bandwidth_commands(bandwidth_hz) -> list:
    """Full sequence to change the low-pass bandwidth: unlock, write, save."""
    value = BANDWIDTH_VALUES[bandwidth_hz]
    return [
        unlock_command(),
        write_register_command(BANDWIDTH_REGISTER, value),
        save_command(),
    ]


def set_algorithm_commands(six_axis: bool = True) -> list:
    """Switch between the 6-axis and 9-axis attitude solutions."""
    value = ALGORITHM_6AXIS if six_axis else ALGORITHM_9AXIS
    return [
        unlock_command(),
        write_register_command(ALGORITHM_REGISTER, value),
        save_command(),
    ]


def configure_commands(rate_hz=100, bandwidth_hz=188, six_axis=True) -> list:
    """Everything the whip measurement needs, in one sequence.

    Order matters only in that each write must sit between an unlock and a
    save; the module accepts them as independent transactions.
    """
    return (set_rate_commands(rate_hz)
            + set_bandwidth_commands(bandwidth_hz)
            + set_algorithm_commands(six_axis))
