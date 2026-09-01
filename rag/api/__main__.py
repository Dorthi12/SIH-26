"""python -m api entry point."""
from api.main import *
import api.main as _m
_m.__name__ = "__main__"
import runpy as _rp
import sys as _sys
_sys.exit(_rp.run_module("api.main", run_name="__main__", alter_sys=True))
