"""Tests against synthetic packets built from the WitMotion BLE 5.0 protocol.

These run anywhere (no BLE needed): python -m pytest sensors/daq/tests/
"""

import struct
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import protocol
from protocol import PacketStream, RegisterReply, Sample


def make_data_packet(raw9):
    return bytes([0x55, 0x61]) + struct.pack("<9h", *raw9)


def make_register_packet(register, raw4):
    return bytes([0x55, 0x71, register, 0x00]) + struct.pack("<4h", *raw4) + bytes(8)


ZERO = [0] * 9


class TestScaling:
    def test_zero_packet(self):
        (s,) = PacketStream().feed(make_data_packet(ZERO))
        assert s == Sample(0, 0, 0, 0, 0, 0, 0, 0, 0)

    def test_accel_full_scale(self):
        raw = ZERO[:]
        raw[2] = 32767  # az
        (s,) = PacketStream().feed(make_data_packet(raw))
        assert s.az == pytest.approx(16 * 9.80665, rel=1e-3)

    def test_accel_negative(self):
        raw = ZERO[:]
        raw[0] = -32768  # ax
        (s,) = PacketStream().feed(make_data_packet(raw))
        assert s.ax == pytest.approx(-16 * 9.80665)

    def test_accel_one_g(self):
        raw = ZERO[:]
        raw[2] = 2048  # 2048/32768*16 = 1 g exactly
        (s,) = PacketStream().feed(make_data_packet(raw))
        assert s.az == pytest.approx(9.80665)

    def test_gyro_scale(self):
        raw = ZERO[:]
        raw[3] = 16384  # half scale -> 1000 deg/s
        (s,) = PacketStream().feed(make_data_packet(raw))
        assert s.gx == pytest.approx(1000.0)

    def test_angle_scale(self):
        raw = ZERO[:]
        raw[6] = 16384  # half scale -> 90 deg roll
        (s,) = PacketStream().feed(make_data_packet(raw))
        assert s.roll == pytest.approx(90.0)

    def test_little_endian_byte_order(self):
        # ax raw = 0x0102 = 258 must be encoded low byte first
        pkt = bytes([0x55, 0x61, 0x02, 0x01]) + bytes(16)
        (s,) = PacketStream().feed(pkt)
        assert s.ax == pytest.approx(258 * protocol.SCALE_ACCEL)


class TestFraming:
    def test_two_packets_one_chunk(self):
        stream = PacketStream()
        out = stream.feed(make_data_packet(ZERO) + make_data_packet(ZERO))
        assert len(out) == 2
        assert stream.dropped_bytes == 0

    def test_packet_split_across_chunks(self):
        pkt = make_data_packet(ZERO)
        stream = PacketStream()
        assert stream.feed(pkt[:7]) == []
        (s,) = stream.feed(pkt[7:])
        assert isinstance(s, Sample)
        assert stream.dropped_bytes == 0

    def test_byte_at_a_time(self):
        pkt = make_data_packet(ZERO)
        stream = PacketStream()
        out = []
        for i in range(len(pkt)):
            out += stream.feed(pkt[i:i + 1])
        assert len(out) == 1

    def test_resync_after_garbage(self):
        stream = PacketStream()
        out = stream.feed(b"\x01\x02\x03" + make_data_packet(ZERO))
        assert len(out) == 1
        assert stream.dropped_bytes == 3

    def test_recovers_after_truncated_packet(self):
        # The 0x61 stream packet has NO checksum, so a mid-packet truncation
        # is undetectable: the framer emits one corrupt sample built from the
        # spliced bytes. What matters is that it re-locks onto the stream —
        # by the next intact packet at the latest. (On BLE this barely
        # matters: losses drop whole notifications; the logger catches those
        # via arrival-time gaps.)
        good = make_data_packet([1000] * 9)
        stream = PacketStream()
        out = stream.feed(make_data_packet(ZERO)[:12] + good + good)
        assert out[-1].ax == pytest.approx(1000 * protocol.SCALE_ACCEL)

    def test_stray_header_byte_in_garbage(self):
        # 0x55 appearing in junk must not wedge the framer
        stream = PacketStream()
        out = stream.feed(b"\x55\x00\x55\x99" + make_data_packet(ZERO))
        assert len(out) == 1

    def test_register_reply_parsed(self):
        stream = PacketStream()
        (r,) = stream.feed(make_register_packet(0x03, [0x09, 0, 0, 0]))
        assert isinstance(r, RegisterReply)
        assert r.register == 0x03
        assert r.values[0] == 0x09


class TestCommands:
    def test_unlock(self):
        assert protocol.unlock_command() == bytes([0xFF, 0xAA, 0x69, 0x88, 0xB5])

    def test_save(self):
        assert protocol.save_command() == bytes([0xFF, 0xAA, 0x00, 0x00, 0x00])

    def test_read_register(self):
        assert protocol.read_register_command(0x3A) == bytes(
            [0xFF, 0xAA, 0x27, 0x3A, 0x00])

    def test_set_rate_100(self):
        unlock, write, save = protocol.set_rate_commands(100)
        assert unlock == protocol.unlock_command()
        assert write == bytes([0xFF, 0xAA, 0x03, 0x09, 0x00])
        assert save == protocol.save_command()

    def test_set_rate_200(self):
        _, write, _ = protocol.set_rate_commands(200)
        assert write == bytes([0xFF, 0xAA, 0x03, 0x0B, 0x00])

    def test_unknown_rate_rejected(self):
        with pytest.raises(KeyError):
            protocol.set_rate_commands(123)


class TestConfigCommands:
    """Byte strings checked against the worked examples in
    'WT9011DCL-BT50 Communication Protocol.pdf' (sensors/datasheets/)."""

    def test_set_bandwidth_188(self):
        # Protocol doc 3.9, verbatim: "Example: FFAA1F0100 (set bandwidth to 188Hz)"
        unlock, write, save = protocol.set_bandwidth_commands(188)
        assert unlock == protocol.unlock_command()
        assert write == bytes([0xFF, 0xAA, 0x1F, 0x01, 0x00])
        assert save == protocol.save_command()

    def test_bandwidth_default_is_the_trap(self):
        # 0x04 is the module's factory default and sits inside the whip band.
        _, write, _ = protocol.set_bandwidth_commands(20)
        assert write == bytes([0xFF, 0xAA, 0x1F, 0x04, 0x00])

    def test_set_six_axis(self):
        # Protocol doc 3.8, verbatim: "Set 6-axis: FFAA240100"
        _, write, _ = protocol.set_algorithm_commands(six_axis=True)
        assert write == bytes([0xFF, 0xAA, 0x24, 0x01, 0x00])

    def test_set_nine_axis(self):
        _, write, _ = protocol.set_algorithm_commands(six_axis=False)
        assert write == bytes([0xFF, 0xAA, 0x24, 0x00, 0x00])

    def test_configure_is_three_unlocked_transactions(self):
        cmds = protocol.configure_commands(100, 188, six_axis=True)
        assert len(cmds) == 9
        assert cmds[0::3] == [protocol.unlock_command()] * 3
        assert cmds[2::3] == [protocol.save_command()] * 3
        assert cmds[1] == bytes([0xFF, 0xAA, 0x03, 0x09, 0x00])   # 100 Hz
        assert cmds[4] == bytes([0xFF, 0xAA, 0x1F, 0x01, 0x00])   # 188 Hz BW
        assert cmds[7] == bytes([0xFF, 0xAA, 0x24, 0x01, 0x00])   # 6-axis

    def test_unknown_bandwidth_rejected(self):
        with pytest.raises(KeyError):
            protocol.set_bandwidth_commands(77)
