#!/bin/sh
# usage: sh scripts/sheet.sh out/prefix_ "f1 f2 ..." out/sheet.jpg  (rows of 5)
P=$1; FR=$2; OUT=$3; ARGS=""; N=0
for f in $FR; do ARGS="$ARGS -i ${P}${f}.jpg"; N=$((N+1)); done
COLS=5; [ $N -lt 5 ] && COLS=$N
ffmpeg -v error -y $ARGS -filter_complex "xstack=inputs=$N:layout=$(python -c "
n=$N;c=$COLS;print('|'.join(f'{(i%c)}*w0_{(i//c)}*h0'.replace('*w0','_w0' if False else '*w0') for i in range(n)))" | python -c "
import sys;s=sys.stdin.read().strip();parts=[]
for p in s.split('|'):
  a,b=p.split('_');i=int(a.split('*')[0]);j=int(b.split('*')[0])
  parts.append(('+'.join(['w0']*i) or '0')+'_'+('+'.join(['h0']*j) or '0'))
print('|'.join(parts))"):fill=black" $OUT
