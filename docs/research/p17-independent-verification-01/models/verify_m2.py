# STATUS: HISTORICAL CALCULATOR (revision 02, 2026-09-12). Unmodified below this banner.
# The canonical calculator is ../redteam/R3-reviewer-corrections-calc.py (committed output ../redteam/R3-output.txt); the specification is the report §5 (index §5.7).
# Superseded here: M2's arithmetic, including the expectation multiplier the report does not adopt.
def clamp(x,lo,hi): return max(lo,min(hi,x))

def star_power_delta(fameBefore, roleWeight, total, aud, expectedTotal):
    reach01 = total/(total+10)
    audGain = clamp((aud-40)/(65-40),0,1.2)
    fcMult = clamp(1+0.3*(total/expectedTotal-1),0.85,1.15)
    room = ((100-fameBefore)/100)**1.6
    gain = 9*roleWeight*reach01*audGain*fcMult*room
    loss = 16*roleWeight*reach01*clamp((45-aud)/45,0,1)*(fameBefore/100)**1.5
    delta = clamp(gain-loss,-4,10)
    return dict(reach01=reach01,audGain=audGain,fcMult=fcMult,room=room,gain=gain,loss=loss,delta=delta,fameAfter=fameBefore+delta)

print("CASE C film1 (hit)")
r=star_power_delta(55,1.0,250,78,120)
for k,v in r.items(): print(f"  {k}={v:.4f}")

print("CASE C film2 (flop)")
r2=star_power_delta(58.3,1.0,65,32,188.5)
for k,v in r2.items(): print(f"  {k}={v:.4f}")

print("CASE G reboot")
r3=star_power_delta(45,1.0,40,30,70.8)
for k,v in r3.items(): print(f"  {k}={v:.4f}")

# placeholder RMF
def dM(total,expected): return clamp(20*(total/expected-1),-25,25)
def dF(aud,similarity=1.0): return max(0,10*(1-aud/100))*similarity

print("\nMomentum/Fatigue placeholders")
print("film1 dM=",dM(250,120),"dF=",dF(78))
print("film2 dM=",dM(65,188.5),"dF=",dF(32))
print("reboot dM=",dM(40,70.8),"dF=",dF(30))

print("\nexpectationMult checks")
def em(rec,mom): return clamp(1+0.6*rec+0.4*max(0,mom),1.0,1.6)
print("film2 em(0.55,0.85)=",em(0.55,0.85))
print("reboot em(0.30,0)=",em(0.30,0))
