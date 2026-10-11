#!/usr/bin/env python3
"""Write an image out of a saved CDP response file.

Handles both shapes the browser tool saves when a response is too large:
  - Runtime.evaluate returning a data URL: {"result": {"value": "data:image/...;base64,..."}}
  - Page.captureScreenshot:                {"data": "<base64>"}

Usage: save_cdp_image.py <cdp-response.json> <output-path>
"""
import base64
import json
import sys


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, out = sys.argv[1], sys.argv[2]
    with open(src) as f:
        payload = json.load(f)

    if "data" in payload:
        b64 = payload["data"]
    else:
        value = payload.get("result", {}).get("value")
        if not isinstance(value, str) or "," not in value:
            sys.exit(f"{src}: no data URL in result.value")
        b64 = value.split(",", 1)[1]

    with open(out, "wb") as f:
        f.write(base64.b64decode(b64))
    print(out)


if __name__ == "__main__":
    main()
