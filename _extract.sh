#!/bin/bash
# Extrai apenas o corpo HTML (sem OG_B64 e sem favicon base64)
cd /home/ubuntu/bolao-copa26
python3 << 'PY'
src = open('landing.ts').read()
# Remove OG_B64 long string
import re
src2 = re.sub(r'const OG_B64 = "[^"]+";', 'const OG_B64 = "TRUNCATED";', src)
# Remove favicon base64
src3 = re.sub(r'data:image/png;base64,[A-Za-z0-9+/=]{200,}', 'data:image/png;base64,FAVTRUNC', src2)
open('_landing_slim.txt','w').write(src3)
print("ok", len(src3))
PY
