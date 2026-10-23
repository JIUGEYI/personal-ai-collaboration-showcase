"""Recompute finite-lot sampling and cost scenarios. Python 3, standard library only."""
import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def pa(N,D,n,c):
    return sum(math.comb(D,k)*math.comb(N-D,n-k) for k in range(max(0,n-N+D),min(c,D,n)+1))/math.comb(N,n)

def calculate():
    inputs=json.loads((ROOT/'evidence/acceptance-inputs.json').read_text(encoding='utf-8'))
    rows=[];hb=ha=rb=ra=0
    for r in inputs['batches']:
        N=r['N']; dg=N//100;db=(3*N+99)//100
        nb,cb=r['baseline'];na,ca=r['optimized']
        assert 0<=cb<=nb<=N and 0<=ca<=na<=N
        gb,bb=pa(N,dg,nb,cb),pa(N,db,nb,cb)
        ga,ba=pa(N,dg,na,ca),pa(N,db,na,ca)
        assert ga>=.9 and ba<=.1 and ca/na<=.02
        feasible=[]
        for n in range(1,na+1):
            for c in range(n//50+1):
                if pa(N,db,n,c)<=.1 and pa(N,dg,n,c)>=.9:
                    feasible.append([n,c])
            if feasible: break
        assert [na,ca] in feasible
        hb+=nb*r['minutes_per_record']/60;ha+=na*r['minutes_per_record']/60
        rb+=1-gb;ra+=1-ga
        rows.append(dict(batch=r['batch'],good_defects=dg,bad_defects=db,baseline_good_pa=gb,
                         baseline_bad_pa=bb,optimized_good_pa=ga,optimized_bad_pa=ba,minimum_feasible=feasible))
    return dict(nature=inputs['nature'],batches=rows,baseline_hours=hb,optimized_hours=ha,
                baseline_expected_returns=rb,optimized_expected_returns=ra,break_even_return_hours=(ha-hb)/(rb-ra),
                scenarios=[dict(return_hours=R,baseline_total=hb+rb*R,optimized_total=ha+ra*R,
                                saving_fraction=1-(ha+ra*R)/(hb+rb*R)) for R in [0,50,75,100,150]])

if __name__=='__main__':
    result=calculate()
    expected=ROOT/'evidence/acceptance-results.json'
    if expected.exists():
        assert result==json.loads(expected.read_text(encoding='utf-8')), 'Results differ from published snapshot'
        print('PASS: six batches, risk constraints, minimum sample search and cost snapshot.')
    print(json.dumps(result,ensure_ascii=False,indent=2))
