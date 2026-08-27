"""python -m rag.api entry point."""
from rag.api.main import *
import rag.api.main as _m
_m.__name__ = "__main__"
import runpy as _rp
import sys as _sys
_sys.exit(_rp.run_module("rag.api.main", run_name="__main__", alter_sys=True))
