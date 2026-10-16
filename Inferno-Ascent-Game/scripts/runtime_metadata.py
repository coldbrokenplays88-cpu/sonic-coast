"""Write descriptor authoring output to the canonical runtime module."""
import json
import re


def write_runtime_metadata(game_root, filename, binding, value):
    if not re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", binding):
        raise ValueError("Invalid metadata binding")
    if filename not in {"supplemental-frames.js", "traversal-frames.js"}:
        raise ValueError("Unknown metadata module")
    target = game_root.parent / "src" / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(value, separators=(",", ":"))
    target.write_text(
        "// Generated sprite descriptors; source image pixels remain untouched.\n"
        f"export let {binding};\n"
        "export function initializeRuntimeModule() {\n"
        f"  {binding} = {payload};\n"
        "}\n"
        "export function getRuntimeBindings() {\n"
        f"  return {{ {binding}: {{ get: () => {binding}, "
        f"set: value => {{ {binding} = value; }} }} }};\n"
        "}\n"
    )
    print("Updated canonical descriptors; run npm run build:player before testing or committing.")
