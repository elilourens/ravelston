"""Dual WT9011DCL-BT50 BLE logger.

Runs on Windows (WSL cannot see Bluetooth adapters). Requires bleak.

Usage:
    python logger.py scan
    python logger.py record --address AA:BB:.. --address CC:DD:.. \
        --rate 100 --out session_2026-08-14 --label "squat 60kg bumpers"

Output per sensor: <out>/<sensor>.csv with host arrival timestamps, plus
<out>/meta.json describing the session. The WT9011 stream has no sample
counters, so gaps can only be detected from arrival timing: any inter-sample
gap > GAP_FACTOR x nominal period is recorded in <out>/gaps.csv and printed.
Downstream analysis must treat those spans as missing data, not as
continuous time.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import sys
import time
from pathlib import Path

try:
    from bleak import BleakClient, BleakScanner
except ImportError:
    print("bleak is required: pip install bleak (run on Windows, not WSL)")
    sys.exit(1)

import protocol

GAP_FACTOR = 2.5

CSV_FIELDS = [
    "host_ts", "ax", "ay", "az", "gx", "gy", "gz", "roll", "pitch", "yaw",
]


class SensorRecorder:
    def __init__(self, address: str, out_dir: Path, nominal_rate_hz: float):
        self.address = address
        self.stream = protocol.PacketStream()
        self.nominal_period = 1.0 / nominal_rate_hz
        self.last_ts = None
        self.n_samples = 0
        self.gaps = []
        safe = address.replace(":", "-")
        self._fh = open(out_dir / f"{safe}.csv", "w", newline="")
        self._csv = csv.writer(self._fh)
        self._csv.writerow(CSV_FIELDS)

    def on_notify(self, _char, data: bytearray):
        ts = time.monotonic()
        for pkt in self.stream.feed(bytes(data)):
            if not isinstance(pkt, protocol.Sample):
                continue
            if self.last_ts is not None:
                delta = ts - self.last_ts
                if delta > GAP_FACTOR * self.nominal_period:
                    self.gaps.append((self.last_ts, ts, delta))
                    print(f"[{self.address}] GAP {delta*1000:.0f} ms")
            self.last_ts = ts
            self.n_samples += 1
            self._csv.writerow([
                f"{ts:.6f}",
                *(f"{v:.5f}" for v in (pkt.ax, pkt.ay, pkt.az,
                                       pkt.gx, pkt.gy, pkt.gz,
                                       pkt.roll, pkt.pitch, pkt.yaw)),
            ])

    def close(self):
        self._fh.close()


async def scan(timeout: float = 8.0):
    print(f"Scanning {timeout:.0f}s for WitMotion sensors...")
    devices = await BleakScanner.discover(timeout=timeout, return_adv=True)
    found = False
    for device, adv in devices.values():
        uuids = [u.lower() for u in (adv.service_uuids or [])]
        name = device.name or ""
        if protocol.SERVICE_UUID in uuids or name.upper().startswith("WT"):
            print(f"  {device.address}  rssi={adv.rssi}  name={name}")
            found = True
    if not found:
        print("No WitMotion devices found. Are they charged and awake?")


async def record(addresses, rate_hz, out_dir: Path, label: str, bandwidth_hz=188):
    out_dir.mkdir(parents=True, exist_ok=True)
    recorders = {a: SensorRecorder(a, out_dir, rate_hz) for a in addresses}
    clients = []
    started = time.monotonic()

    async def connect(address: str):
        client = BleakClient(address)
        await client.connect()
        # Rate AND bandwidth: the module ships with a 20 Hz low-pass that would
        # filter the whip band away before it reaches us, and would also make
        # a 100 Hz stream emit repeated samples. See protocol.BANDWIDTH_VALUES.
        for cmd in protocol.configure_commands(rate_hz, bandwidth_hz):
            await client.write_gatt_char(protocol.WRITE_UUID, cmd, response=False)
            await asyncio.sleep(0.1)
        await client.start_notify(protocol.NOTIFY_UUID, recorders[address].on_notify)
        print(f"[{address}] connected, {rate_hz} Hz output, {bandwidth_hz} Hz bandwidth")
        return client

    try:
        clients = await asyncio.gather(*(connect(a) for a in addresses))
        print("Recording — Ctrl+C to stop.")
        while True:
            await asyncio.sleep(5)
            status = "  ".join(
                f"{a}: {r.n_samples} samples, {len(r.gaps)} gaps"
                for a, r in recorders.items()
            )
            print(status)
    except (KeyboardInterrupt, asyncio.CancelledError):
        pass
    finally:
        for client in clients:
            try:
                await client.disconnect()
            except Exception:
                pass
        with open(out_dir / "gaps.csv", "w", newline="") as fh:
            writer = csv.writer(fh)
            writer.writerow(["sensor", "from_ts", "to_ts", "delta_s"])
            for a, r in recorders.items():
                for row in r.gaps:
                    writer.writerow([a, *(f"{v:.6f}" for v in row)])
        meta = {
            "label": label,
            "addresses": list(addresses),
            "rate_hz": rate_hz,
            "duration_s": round(time.monotonic() - started, 1),
            "samples": {a: r.n_samples for a, r in recorders.items()},
            "gaps": {a: len(r.gaps) for a, r in recorders.items()},
            "dropped_bytes": {a: r.stream.dropped_bytes for a, r in recorders.items()},
        }
        with open(out_dir / "meta.json", "w") as fh:
            json.dump(meta, fh, indent=2)
        for r in recorders.values():
            r.close()
        print(f"Saved to {out_dir}/  —  {json.dumps(meta['samples'])}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("scan")
    rec = sub.add_parser("record")
    rec.add_argument("--address", action="append", required=True,
                     help="sensor MAC/address; pass twice for both bar ends")
    rec.add_argument("--rate", type=int, default=100,
                     choices=sorted(int(r) for r in protocol.RATE_VALUES if r >= 1))
    rec.add_argument("--bandwidth", type=int, default=188,
                     choices=sorted(protocol.BANDWIDTH_VALUES),
                     help="low-pass bandwidth; keep well above the whip band "
                          "(module default of 20 Hz would filter it out)")
    rec.add_argument("--out", type=Path, required=True)
    rec.add_argument("--label", default="")
    args = parser.parse_args()

    if args.cmd == "scan":
        asyncio.run(scan())
    else:
        asyncio.run(record(args.address, args.rate, args.out, args.label,
                           args.bandwidth))


if __name__ == "__main__":
    main()
