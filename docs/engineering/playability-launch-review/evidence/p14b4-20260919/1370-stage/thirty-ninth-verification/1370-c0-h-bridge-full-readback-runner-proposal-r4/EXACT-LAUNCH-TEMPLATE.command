# TEMPLATE ONLY. A separately reviewed 630s outer recorder must SHA-execute BOOTSTRAP.py as child.
# It must pin BOOTSTRAP.py SHA, fill two 64-hex arguments, own the recorded heavy lane, and record child exit/group cleanup.
python3 -I -B /Users/zacheryspector/studio-scratch/1370-c0-h-bridge-full-readback-runner-proposal-r4/BOOTSTRAP.py __FILLED_BINDING_SHA__ __READBACK_STATIC_REVIEW_SHA__
