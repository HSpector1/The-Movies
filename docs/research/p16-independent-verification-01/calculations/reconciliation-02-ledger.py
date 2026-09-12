# Reproduces every figure in P16-RECONCILIATION-02.md §5 (paper hypotheses). Run: python3 reconciliation-02-ledger.py
def weekly(annual): return round(annual/52)
def cap(w, rem): return w*min(rem,26)
# --- Healthy target T
cash=2_000_000; fac=6_000_000; sets=1_000_000
refund=fac*0.5+sets*0.35
star_w=weekly(2_000_000); star_rem=104
crew_w=weekly(260_000); crew_rem=60; n_crew=4
star_g=star_w*star_rem; star_c=cap(star_w,star_rem)
crew_g=crew_w*crew_rem; crew_c=cap(crew_w,crew_rem)
G=star_g+n_crew*crew_g; C=star_c+n_crew*crew_c
surplus=900_000
op_lo=3*surplus+cash; op_hi=6*surplus+cash
book=cash+refund
print("refund basis",refund,"book(LIQ)",book,"liquidation",book,"operating range",op_lo,op_hi)
print("star weekly",star_w,"guar",star_g,"cap",star_c)
print("crew weekly",crew_w,"guar",crew_g,"cap",crew_c,"x4 guar",n_crew*crew_g,"x4 cap",n_crew*crew_c)
print("total guar",G,"total caps",C)
B=5_000_000; prem=1.3; consid=B*prem
print("consideration",consid)
ref=consid-cash
cases={"K0 continue none":C,"K1 continue all":0,"K2 star only":n_crew*crew_c,"K3 crew only":star_c}
for k,ex in cases.items():
    xfer=cash-ex; out=consid-xfer
    print(k,"exits",ex,"cash xfer",xfer,"closing outlay",out,"delta vs no-contract ref",out-ref)
k4=ref+star_c+star_w
print("K4 continue all then release star wk+1: outlay",k4,"delta",k4-ref)
# old rule
old_price=consid+cash-G; old_net=old_price-cash
print("OLD price",old_price,"old net closing outlay",old_net)
print("OLD K0 fire all @cap",old_net+C,"gain vs ref",ref-(old_net+C))
print("OLD K0 fire all @50%",old_net+round(0.5*G),"gain vs ref",ref-(old_net+round(0.5*G)))
print("STAR only: old deduction",star_g,"termination",star_c,"gain",star_g-star_c, "50% termination",round(0.5*star_g),"gain",star_g-round(0.5*star_g))
# --- Distressed Ridgeline
rcash=-800_000; rfac=3_000_000; rref=rfac*0.5; props=4; appr=75_000
ew=weekly(156_000); erem=80; eg=ew*erem; ec=cap(ew,erem)
print("Ridgeline emp weekly",ew,"guar each",eg,"x5",5*eg,"cap each",ec,"x5",5*ec)
frp=rref+rcash
print("FRP (P15, library excluded)",frp)
floor_each=round(0.8*appr); reserve=rref+props*floor_each
print("lot reserve",reserve,"prop floor each",floor_each)
bid=1_800_000
claims_all=800_000+5*eg
cont=2
claims=800_000+(5-cont)*eg
print("claims if none continued",claims_all,"claims with 2 continued",claims,"surplus",bid-claims)
print("acquirer net after R21 credit",bid-rref,"continued payroll",cont*ew*erem, "bonus alt",2*round(0.18*156_000))
# --- Scenario E re-run
# Deal 1
sv1=4_500_000;p1=1.3;c1=300_000; w1=2_000;n1=12;cap1=40;roster1=30
cont1=cap1-roster1; dec1=n1-cont1; ex1=dec1*cap(w1,40)
xfer1=c1-ex1; out1=sv1*p1-xfer1
pre1=8_000_000; post1=pre1-out1; obl1=60_000+cont1*w1; req1=26*obl1
print("Deal1 continue",cont1,"decline",dec1,"exits",ex1,"xfer",xfer1,"outlay",out1,"post cash",post1,"req",req1,"margin",post1-req1)
# Deal 2
sv2=6_500_000;p2=1.6;c2=500_000;w2=2_500;n2=20;cap2=45;roster2=40
cont2=cap2-roster2;dec2=n2-cont2;ex2=dec2*cap(w2,50)
xfer2=c2-ex2;out2=sv2*p2-xfer2
pre2=post1+9_500_000;post2=pre2-out2;obl2=obl1+cont2*w2;req2=26*obl2
print("Deal2 continue",cont2,"decline",dec2,"exits",ex2,"xfer",xfer2,"outlay",out2,"pre",pre2,"post",post2,"req",req2,"shortfall",req2-post2)
post2b=post2+1_800_000
print("after +40wk +1.8M post",post2b,"margin",post2b-req2)
print("old deal2 outlay 10,137,500 -> corrected",out2,"diff",out2-10_137_500)
