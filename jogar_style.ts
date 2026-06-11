export const CSS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');\n:root{--pri:#14794a;--pri2:#1faa59;--bg:#0e1117;--card:#171c26;--card2:#1f2633;--tx:#ffffff;--mut:#94a0b4;--bd:#283142;--gold:#f5c451;--no:#e23744;--bgrad:radial-gradient(120% 110% at 50% -10%,#0b3d2e 0%,#0a1228 48%,#080d18 100%);--panel:rgba(16,21,30,.985);--surface:rgba(23,28,38,.66);--surface2:rgba(255,255,255,.06);--flagbg:#2a3142;}
body.light{--card:#ffffff;--card2:#eef1f8;--tx:#1b2230;--mut:#5d6678;--bd:#e2e6f0;--bgrad:radial-gradient(120% 110% at 50% -10%,#e7f4ec 0%,#eef1f8 45%,#e6ebf3 100%);--panel:rgba(255,255,255,.99);--surface:#ffffff;--surface2:#eef1f8;--flagbg:#e6e8f0;}
.tgl{background:var(--surface2);border:1px solid var(--bd);color:var(--tx);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:15px;flex:none;display:flex;align-items:center;justify-content:center}
*{box-sizing:border-box}html,body{margin:0}body{font-family:'Poppins',system-ui,Segoe UI,Roboto,sans-serif;background:var(--bgrad) fixed;color:var(--tx);min-height:100vh;-webkit-tap-highlight-color:transparent;overflow-x:clip}
a{color:inherit;text-decoration:none}
.top{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;padding:8px 14px;height:52px;box-sizing:border-box;background:var(--panel);backdrop-filter:blur(8px);border-bottom:1px solid var(--bd)}.top{padding-right:max(14px,calc(100% - 1050px))}@media(max-width:760px){.top{padding-right:14px}}
.burger{font-size:22px;background:none;border:0;color:var(--tx);cursor:pointer;display:none}
.brand{font-weight:800;font-size:15px;white-space:nowrap}
.brand b{color:var(--pri2)}\n.brand span{text-transform:uppercase}\n.brand .bmgr{font-size:9px;font-weight:800;letter-spacing:.5px;color:var(--mut);background:var(--surface2);border:1px solid var(--bd);border-radius:6px;padding:2px 7px;white-space:nowrap;align-self:center;text-transform:none}
.wallets{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}
.w{display:flex;align-items:center;gap:5px;background:var(--card2);border:1px solid var(--bd);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}
.w small{color:var(--mut);font-weight:600}
.av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pri2));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;cursor:pointer;flex:none}
.layout{display:flex;min-height:calc(100vh - 52px)}
.side{width:210px;flex:none;align-self:flex-start;position:sticky;top:52px;min-height:calc(100vh - 52px);background:var(--panel);backdrop-filter:blur(8px);border-right:1px solid var(--bd);padding:10px 7px;display:flex;flex-direction:column;gap:2px}
.side a{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:9px;font-weight:600;font-size:13.5px;color:var(--tx);cursor:pointer;white-space:nowrap}.side a .tag,.side a .free{margin-left:auto}
.side a .ic{width:20px;text-align:center}
.side a:hover{background:var(--card)}
.side a.on{background:var(--pri);color:#fff}
.side a.soon{opacity:.5;cursor:not-allowed;color:var(--mut)}
.side a .tag{margin-left:auto;display:inline-flex;align-items:center;font-size:8px;background:var(--bd);color:var(--mut);padding:2px 6px;border-radius:6px;line-height:1}
.main{flex:1;min-width:0;padding:16px;max-width:840px}
.sec{display:none}.sec.on{display:block;animation:fade .25s ease}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
h1{font-size:18px;margin:0 0 12px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.card{background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:13px}
.card h3{margin:0 0 3px;font-size:12px;color:var(--mut);font-weight:700}
.stat{font-size:22px;font-weight:800}
.radar{position:relative}.radar::before,.radar::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:0 0 0 0 rgba(31,170,89,.55);animation:radarpulse 2s ease-out infinite}.radar::after{animation-delay:1s}@keyframes radarpulse{0%{box-shadow:0 0 0 0 rgba(31,170,89,.5)}70%{box-shadow:0 0 0 18px rgba(31,170,89,0)}100%{box-shadow:0 0 0 0 rgba(31,170,89,0)}}.btn{background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff;border:0;border-radius:11px;padding:12px 20px;font-weight:800;cursor:pointer;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:7px;text-align:center;box-shadow:0 4px 12px rgba(31,170,89,.22);transition:.15s}
.btn.ghost{background:var(--card2);color:var(--tx);border:1px solid var(--bd);box-shadow:none}
.btn:disabled{opacity:.4;filter:grayscale(.5);cursor:not-allowed;box-shadow:none;transform:none}
.btn:disabled:hover{transform:none;box-shadow:none;filter:grayscale(.5)}
.btn:hover{transform:translateY(-1px);box-shadow:0 7px 18px rgba(31,170,89,.32);filter:brightness(1.06)}
.btn:active{transform:translateY(0)}
.btn.ghost:hover{border-color:var(--pri2);background:var(--surface2);box-shadow:none;filter:none}
.btn.mini{padding:8px 13px;font-size:12.5px;box-shadow:none}
.iaresumo{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,rgba(31,170,89,.16),rgba(31,170,89,.06));border:1px solid rgba(31,170,89,.4);border-radius:13px;padding:13px 15px;margin:4px 0}
.iaresumo .iadot{font-size:22px}
.iaresumo .iainfo{display:flex;flex-direction:column;line-height:1.25;flex:1;min-width:0}
.iaresumo .iainfo b{font-size:14px}.iaresumo .iainfo small{color:var(--mut);font-size:12px}
.iaracts{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.btn.dang{background:linear-gradient(135deg,#e9485a,#b91c2b);color:#fff;border:0;box-shadow:0 4px 12px rgba(226,55,68,.28)}
.btn.dang:hover{background:linear-gradient(135deg,#e9485a,#b91c2b);color:#fff;filter:brightness(1.06);transform:translateY(-1px);box-shadow:0 7px 18px rgba(226,55,68,.36)}

.btn:disabled{opacity:.5;cursor:not-allowed}
.muted{color:var(--mut);font-size:13px}
.flag{width:22px;height:16px;border-radius:3px;object-fit:cover;vertical-align:middle;background:var(--card2)}
.jrow{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:10px;margin-bottom:8px}
.jteam{display:flex;align-items:center;gap:7px;flex:1;min-width:0;font-weight:600;font-size:14px}
.jteam.r{justify-content:flex-end;text-align:right}
.jteam span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pin{width:38px;text-align:center;background:var(--card2);border:1px solid var(--bd);color:var(--tx);border-radius:8px;padding:8px 0;font-size:16px;font-weight:800}
.pin:disabled{opacity:.6}
.tabs{display:inline-flex;gap:3px;margin-bottom:14px;background:var(--card2);border:1px solid var(--bd);border-radius:999px;padding:4px}
.tab{padding:7px 18px;border-radius:999px;background:transparent;border:0;color:var(--mut);font-weight:700;font-size:13px;cursor:pointer;transition:.15s;white-space:nowrap}
.tab.lock{color:#aab0ba !important;opacity:.8;cursor:not-allowed}
#bolao-tabs{display:grid;grid-template-columns:1.05fr 0.95fr;gap:10px;align-items:center;width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;background:var(--surface);border-radius:14px;padding:10px 12px}\n#copa-tabs,#rank-tabs,#s-ia .tabs,#s-custo .tabs{background:var(--surface);border:1px solid var(--bd);border-radius:14px;padding:8px 10px}
.tabL{display:flex;align-items:center;gap:6px;min-width:0}
.tabR{min-width:0;display:flex;align-items:center;padding-left:12px;border-left:1px solid var(--bd)}
.tabM{display:flex;align-items:center;gap:4px;width:100%;overflow-x:auto}
.lpbtn{display:inline-flex;align-items:center;gap:7px;margin:0 0 14px;padding:10px 18px;border:0;border-radius:999px;background:linear-gradient(135deg,#f6c83a,#e0a008);color:#3a2a00;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 5px 16px rgba(224,160,8,.45)}
.lpbtn:hover{filter:brightness(1.06)}
.lpbanner{display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:11px 14px;border-radius:14px;cursor:pointer;background:var(--surface);border:1px solid var(--bd);border-left:4px solid #e0a008;transition:.15s}.lpbanner:hover{border-color:#e0a008;background:var(--card)}.lpb-ic{font-size:22px;flex:none}.lpb-tx{display:flex;flex-direction:column;min-width:0}.lpb-tx b{font-size:14px}.lpb-tx span{font-size:11.5px;color:var(--mut)}.lpb-ar{margin-left:auto;font-size:24px;font-weight:800;flex:none;color:var(--mut)}
.tab.lpwide{flex:1;min-width:0;display:inline-flex;align-items:center;gap:8px;color:#fff !important;border:0;white-space:nowrap;height:38px;padding:0 14px}.tab.lpwide svg{width:16px;height:16px;flex:none}.lpwt{font-weight:500;overflow:hidden;text-overflow:ellipsis}.lpst{margin-left:auto;font-size:11px;font-weight:700;padding:2px 9px;border-radius:999px;flex:none}.lpst.pend{background:rgba(255,255,255,.24);color:#fff}.lpst.done{background:#fff;color:var(--bar,#1f7a45)}
.lphd{display:flex;align-items:center;gap:8px;margin:0 0 4px}.lphd b{font-size:16px}.lphdic{font-size:18px}.lpsub{font-size:12px;color:var(--mut);margin:0 0 12px}.lpauto{display:flex;gap:8px;margin:0 0 12px}.lpab{flex:1;border:1px solid var(--bd);background:var(--card2);color:var(--tx);border-radius:10px;padding:8px;font-size:12.5px;font-weight:700;cursor:pointer}.lpab.ia{background:rgba(31,170,89,.10);border-color:var(--pri);color:var(--pri)}.lpab:hover{filter:brightness(1.04)}.lplist{display:flex;flex-direction:column;gap:7px}.lprow{display:flex;align-items:center;gap:9px}.lpmed{width:23px;height:23px;border-radius:50%;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex:none;border:1.5px solid rgba(255,255,255,.45);box-shadow:0 2px 5px rgba(0,0,0,.22),inset 0 1px 1px rgba(255,255,255,.4);text-shadow:0 1px 1px rgba(0,0,0,.25)}.lpmed.gold{background:linear-gradient(145deg,#f8d873,#d99708)}.lpmed.silver{background:linear-gradient(145deg,#cfd4d9,#878d94)}.lpmed.bronze{background:linear-gradient(145deg,#dca06a,#9c571f)}.lpmed.p4{background:linear-gradient(145deg,#a6acb3,#6a7077)}.lpmed.art{background:linear-gradient(145deg,#2bd07a,#0f7a45)}.acimg.sil{display:inline-flex;align-items:center;justify-content:center;color:var(--mut);opacity:.7}.acimg.sil svg{width:17px;height:17px}.lplab{font-size:12.5px;color:var(--mut);flex:none;width:60px}.lppts{font-size:12px;font-weight:800;color:var(--mut);flex:none;width:28px;text-align:right}.acf{position:relative;flex:1;min-width:0;display:flex;align-items:center;gap:7px;border:1px solid var(--bd);border-radius:10px;padding:6px 10px;background:var(--surface)}.acf:focus-within{border-color:var(--pri)}.acx{position:absolute;top:-6px;right:-6px;z-index:4;opacity:0;width:15px;height:15px;border-radius:50%;background:var(--bar,#14a06a);border:1.5px solid var(--surface);color:#fff;font-size:10px;font-weight:800;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .15s,filter .15s}.lprow:hover .acf.has .acx,.acf.has:focus-within .acx,.acx:hover{opacity:1}.acx:hover{filter:brightness(1.12)}.acico{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:22px}.acimg{width:22px;height:16px;object-fit:cover;border-radius:2px;flex:none}.acimg.fig{width:18px;height:24px;border-radius:3px}.acin{flex:1;min-width:0;border:0;background:transparent;color:inherit;font-size:13.5px;outline:none}.acdd{position:absolute;top:calc(100% + 4px);left:0;right:0;max-height:210px;overflow-y:auto;background:var(--surface);border:1px solid var(--bd);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.25);z-index:30;display:none}.acdd.on{display:block}.acopt{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;font-size:13px}.acopt:hover{background:var(--card2)}.acopt.empty{color:var(--mut);cursor:default}
.tab.lpmini{display:inline-flex;align-items:center;justify-content:center;background:#e9a90c;color:#3a2a00 !important;padding:7px 11px;flex:none}.tab.lpmini svg{width:16px;height:16px}
.tabdiv{width:1px;align-self:stretch;background:var(--bd);margin:0 4px;flex:none}
.lpf{margin-bottom:11px}.lpf label{display:block;font-size:12px;font-weight:700;color:var(--mut);margin-bottom:4px}.lpf select,.lpf input{width:100%;padding:9px 10px;border:1px solid var(--bd);border-radius:9px;background:var(--card);color:inherit;font-size:14px}
.rrow{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--bd);font-size:13.5px}.rrow:first-of-type{border-top:0}.rrow b{font-weight:800;white-space:nowrap}.rrow.rhead{border-top:0;padding:2px 0}.rrow.rhead b{font-size:10.5px;letter-spacing:.6px;color:var(--mut);text-transform:uppercase}
.tab.on{background:var(--pri);color:#fff;border-color:var(--pri)}
.lock{font-size:11px;color:var(--no);font-weight:700}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:8px 8px;border-bottom:1px solid var(--bd);text-align:left}th{color:var(--mut);font-size:11px}
.rkme{background:rgba(31,170,89,.10);border-left:3px solid var(--rkc,#1faa59)}
.rkinfo{font-size:12px;color:var(--mut);margin:-4px 0 14px;padding-left:2px}
.rkrow{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:9px 13px;margin-bottom:8px;transition:.15s}
.rkrow:hover{border-color:var(--rkc,#1faa59)}
.rkrow.me{box-shadow:0 0 0 2px var(--rkc,#1faa59) inset;border-color:transparent}
.rkrow.top1{background:linear-gradient(135deg,color-mix(in srgb,var(--rkc,#1faa59) 28%,var(--card)),color-mix(in srgb,var(--rkc,#1faa59) 8%,var(--card)));border:1.6px solid transparent;box-shadow:0 4px 16px color-mix(in srgb,var(--rkc,#1faa59) 34%,transparent)}
.rkpos{width:32px;text-align:center;font-weight:800;font-size:15px;color:var(--mut);flex:none}
.rkmedal{font-size:22px}
.rkav{width:42px;height:42px;border-radius:50%;overflow:hidden;flex:none;background:linear-gradient(135deg,var(--pri),var(--pri2));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px}
.rkav img{width:100%;height:100%;object-fit:cover}
.rkname{flex:1;min-width:0}
.rkname b{display:block;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rkname small{color:var(--mut);font-size:12px}
.rkyou{font-size:9.5px;font-weight:800;background:var(--rkc,#1faa59);color:#fff;padding:1px 6px;border-radius:6px;margin-left:5px;vertical-align:middle}
.rkpts{margin-left:auto;font-weight:800;font-size:20px;color:var(--rkc,#1faa59);flex:none;display:flex;align-items:baseline;gap:3px}
.rkpts small{font-size:11px;color:var(--mut);font-weight:700}
.rkcols{margin-left:auto;display:flex;gap:14px;align-items:center;flex:none}
.rkcol{text-align:center;min-width:34px}
.rkcol span{display:block;font-weight:800;font-size:15px;color:var(--mut)}
.rkcol small{font-size:9px;color:var(--mut);font-weight:700;text-transform:uppercase;letter-spacing:.3px}
.rkcol.tot span{color:var(--rkc,#1faa59);font-size:18px}
@media(max-width:560px){.rkcols{gap:9px}.rkcol{min-width:0}}
.gcols{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;align-items:start}\n.nm,.gcols td,.gcols b,.rkname b{color:var(--tx)}
@media(max-width:760px){.gcols{grid-template-columns:1fr}#bolao-tabs,.actpanel{grid-template-columns:1fr}.tabR,.act-logic{border-left:0;padding-left:0}}
.cbody{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;padding:9px 12px;justify-content:center}
.crow{display:flex;align-items:center;gap:8px;min-width:0}
.crow .csc{margin-left:auto;font-weight:800;font-size:16px;min-width:18px;text-align:center;flex:none}
.ctime{flex:none;display:flex;align-items:center;padding:0 12px;border-left:1px solid var(--bd);color:var(--mut);font-size:12px;white-space:nowrap}
.pos{font-weight:800;width:30px}
.medal{font-size:15px}
.qr{width:190px;height:190px;border-radius:12px;background:
 repeating-linear-gradient(90deg,#fff 0 8px,#0e1117 8px 16px),
 repeating-linear-gradient(0deg,rgba(0,0,0,0) 0 8px,rgba(255,255,255,.0) 8px 16px);
 border:8px solid #fff;margin:10px auto;display:flex;align-items:center;justify-content:center}
.qr b{background:#fff;color:#000;padding:4px 8px;border-radius:6px;font-size:11px}
.pack{border:1px solid var(--bd);border-radius:14px;padding:16px;background:linear-gradient(160deg,var(--card2),var(--card))}
.pack.base{border-color:var(--gold)}
.mpframe{background:#fff;color:#1a2233;border:1px solid #d9dee8;border-radius:16px;overflow:hidden;max-width:420px;margin:0 auto;box-shadow:0 10px 30px rgba(20,30,60,.14)}
.mpframe .muted{color:#6b7280}
.mphead{background:#fff;display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #eef0f4}
.mplogo{height:30px;display:block}
.mpsslbadge{margin-left:auto;color:#0f8a4d;font-size:11px;font-weight:800;background:#e7f7ee;padding:4px 10px;border-radius:999px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;border:1px solid #bfe8cf}
.mpbody{padding:11px 16px;background:#fff}
.mpprod{text-align:center;margin-bottom:10px}
.mpprice{font-size:23px;font-weight:800;color:#1a2233}
.mpseals{display:flex;flex-wrap:nowrap;gap:5px;justify-content:center;margin-top:9px;overflow:hidden}
.mpseals span{font-size:9.5px;font-weight:700;color:#5b6472;background:#f4f6f9;border:1px solid #e7eaf0;border-radius:999px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;flex:none}
.mpfoot{background:#fff;border-top:1px solid #eef0f4;padding:6px 14px;display:flex;justify-content:flex-end}
.mpblind{height:28px;opacity:.95}
.mppay{width:100%;background:#009ee3;justify-content:center;font-size:15px;padding:13px;box-shadow:0 4px 12px rgba(0,158,227,.3)}
.mppay:hover{background:#0089c7;filter:none}
.mptrust{display:flex;align-items:flex-start;gap:7px;justify-content:center;font-size:11.5px;color:var(--mut);margin-top:9px;text-align:center;line-height:1.4}
.mpqr{display:flex;justify-content:center;margin:6px 0 10px}
.mpqr img{width:208px;height:208px;border-radius:12px;border:1px solid var(--bd);background:#fff;padding:6px}
.mpcopy{display:flex;gap:8px;margin:6px 0 4px}
.mpcopy input{flex:1;min-width:0;font-size:11px;background:#f4f6f9;border:1px solid #e2e6ee;color:#1a2233;border-radius:8px;padding:8px}
.mpstatus{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;color:var(--mut);margin:12px 0}
.mpstatus .dot{width:9px;height:9px;border-radius:50%;background:var(--gold);animation:pulsedot 1.2s infinite}
@keyframes pulsedot{0%,100%{opacity:1}50%{opacity:.25}}
.mpsim{width:100%;background:#f4f6f9;color:#5b6472;border:1px dashed #cfd5df;box-shadow:none;font-size:13px}
.mpok{text-align:center;padding:8px 0}
.okcheck{width:56px;height:56px;border-radius:50%;background:#1faa59;color:#fff;font-size:30px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-weight:900}
.custgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.custcard{background:var(--surface);border:1px solid var(--bd);border-radius:13px;padding:13px 14px}
.custlbl{font-size:12px;color:var(--mut);font-weight:700}
.custval{font-size:23px;font-weight:800;margin-top:4px}
.cutab{width:100%;border-collapse:collapse;font-size:12.5px}
.cutab th{text-align:left;color:var(--mut);font-weight:700;padding:7px 8px;border-bottom:1px solid var(--bd)}
.cutab td{padding:7px 8px;border-bottom:1px solid var(--bd)}
.tourov{position:fixed;inset:0;background:rgba(8,13,24,.5);display:none;align-items:center;justify-content:center;z-index:200;padding:16px}
.tourov.show{display:flex}
.tourcard{width:380px;max-width:94vw;background:var(--card);border:1px solid var(--bd);border-top:4px solid var(--rc,#14794a);border-radius:18px;padding:15px 16px 14px;box-shadow:0 24px 60px rgba(0,0,0,.55);animation:tin .2s ease}
.tourtop{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:12px;color:var(--mut);font-weight:800}
.tourx{background:none;border:0;color:var(--mut);font-size:20px;cursor:pointer;line-height:1}
.tourgame{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px}
.tg-side{display:flex;flex-direction:column;align-items:center;gap:6px;width:100px;text-align:center}
.tg-side .flagw img,.tg-side .flagw .flag{width:42px;height:31px;border-radius:5px;display:block}
.tg-side>span:last-child{font-size:12.5px;font-weight:700;line-height:1.2}
.tg-score{display:flex;align-items:center;gap:7px}
.tg-stepper{display:flex;flex-direction:column;align-items:center;gap:3px}
.tg-stepper input{width:50px;text-align:center;font-size:26px;font-weight:800;background:var(--surface2);border:1px solid var(--bd);border-radius:10px;color:var(--tx);padding:5px 0}
.tg-stepper button{background:var(--surface2);border:1px solid var(--bd);color:var(--tx);border-radius:7px;width:32px;height:21px;cursor:pointer;font-size:10px;line-height:1}
.tg-stepper button:hover{background:var(--rc,#14794a);color:#fff;border-color:var(--rc,#14794a)}
.tg-x{font-size:17px;color:var(--mut)}
.tourbubble{display:flex;align-items:flex-start;gap:9px;background:var(--surface2);border-radius:12px;padding:10px 12px;font-size:13px;font-weight:600;line-height:1.45;margin-bottom:14px;min-height:42px}
.tourbubble{align-items:center}
.tourbubble .trb{width:34px;height:34px;flex:none;animation:bob 2.6s ease-in-out infinite;filter:drop-shadow(0 2px 6px var(--rc,#14794a))}
.tourbubble .trb svg{width:100%;height:100%;display:block}
.tourbubble #tour-resumo{flex:1}
.tourbubble .tfont{flex:none;align-self:center;font-size:10.5px;font-weight:800;color:var(--mut);background:var(--surface2);border-radius:999px;padding:3px 9px;white-space:nowrap}
.comocalc{color:var(--mut);cursor:pointer;margin-left:5px;font-size:12px;opacity:.7}.comocalc:hover{color:var(--rc,#14794a);opacity:1}
.touraviso{display:flex;align-items:center;gap:7px;background:rgba(245,196,81,.14);border:1px solid rgba(245,196,81,.45);color:var(--gold);font-size:11.5px;font-weight:700;line-height:1.35;border-radius:10px;padding:8px 10px;margin-bottom:12px}
.touractions{display:flex;gap:8px;align-items:center}
.touractions .btn{flex:1}
.touractions .tprev{flex:none;width:44px;padding:11px 0}
.toast{position:fixed;top:66px;right:16px;z-index:400;background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff;border:0;padding:11px 16px;border-radius:11px;font-size:13px;font-weight:700;box-shadow:0 12px 30px rgba(31,170,89,.4);max-width:300px;animation:tin .18s ease}
.toast.err{background:linear-gradient(135deg,#b01b29,#e23744);box-shadow:0 12px 30px rgba(226,55,68,.4)}
@keyframes tin{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.toast.err{border-left-color:var(--no)}
.scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:25}
@media(max-width:760px){
 .side{position:fixed;top:52px;bottom:0;left:0;z-index:40;transform:translateX(-100%);transition:.2s;overflow-y:auto;-webkit-overflow-scrolling:touch}
 .side.open{transform:none}.burger{display:block}.scrim.open{display:block}.main{padding:14px}
 .brand{font-size:13px}.w{padding:4px 8px}
}
.diah{font-size:11px;font-weight:800;letter-spacing:.4px;color:var(--mut);text-transform:uppercase;margin:16px 0 8px}
.jgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:10px}
.jogo{background:var(--surface);border:1px solid var(--bd);border-radius:12px;overflow:visible;display:flex;align-items:stretch;position:relative}.jlimpar{position:absolute;top:-7px;right:-7px;z-index:5;opacity:0;width:15px;height:15px;border-radius:50%;background:var(--rc,#14a06a);border:1.5px solid var(--surface);color:#fff;font-size:10px;font-weight:800;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.3);transition:opacity .15s,transform .15s}.jogo:hover .jlimpar{opacity:1}.jlimpar:hover{transform:scale(1.12)}
.gtab{writing-mode:vertical-rl;transform:rotate(180deg);background:var(--rc,var(--pri));color:#fff;font-weight:800;font-size:10px;letter-spacing:2px;padding:8px 6px;display:flex;align-items:center;justify-content:center;flex:none;border-radius:0 11px 11px 0}
.jbody{flex:1;min-width:0;display:grid;grid-template-columns:1.4fr auto 0.9fr;align-items:center;column-gap:8px;row-gap:9px;padding:10px 12px}
.cn{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden}
.cs{display:flex;align-items:center;gap:6px;justify-self:center}
.cm{justify-self:end;display:flex;align-items:center}.cmtop{gap:10px}.cmbot{gap:5px}
.nm{flex:1;font-size:13.5px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.jflag{width:26px;height:19px;border-radius:3px;object-fit:cover;background:var(--flagbg);flex:none}
.pl{width:46px;text-align:center;font-size:16px;font-weight:800;padding:6px 5px;border:1px solid var(--bd);border-radius:8px;flex:none;background:var(--surface2);color:var(--tx);-moz-appearance:textfield}
.pl::-webkit-inner-spin-button,.pl::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.pl:disabled{opacity:.5}
.step{display:flex;flex-direction:column;gap:2px;flex:none}
.su{background:var(--surface2);color:var(--mut);border:0;border-radius:4px;width:16px;height:13px;font-size:7px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}.su:hover{background:var(--rc,var(--pri));color:#fff}
.fav{display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;color:var(--tx);font-weight:700}.fav i{font-style:normal;font-size:9px;font-weight:800;color:var(--mut)}.fav .jflag{width:22px;height:16px}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:var(--surface2);color:var(--pri2)}.tag.lk{color:var(--no)}
.o365sm{height:19px;width:auto;border-radius:3px;cursor:pointer;transition:.15s}.o365sm:hover{transform:scale(1.12)}
.mov{position:fixed;inset:0;background:rgba(8,12,24,.6);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;z-index:300;padding:18px}
.tourtbtns{display:flex;align-items:center;gap:8px}
.tourq{background:var(--surface2);border:1px solid var(--bd);color:var(--mut);width:22px;height:22px;border-radius:50%;font-weight:800;font-size:12px;cursor:pointer;line-height:1}
.tourq:hover{background:var(--rc,#14794a);color:#fff;border-color:var(--rc,#14794a)}
.audsec{padding:9px 0;border-bottom:1px solid var(--bd);font-size:13px;line-height:1.5}
.audsec:last-child{border-bottom:0}
.audh{font-size:11px;font-weight:800;color:var(--mut);text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px}
.crqf img,.crqf .flag{width:18px;height:13px;border-radius:3px;vertical-align:-1px;margin-right:6px}
.u5{display:inline-block;width:17px;height:17px;line-height:17px;text-align:center;border-radius:5px;font-size:10px;font-weight:800;color:#fff;margin-right:4px}
.u5V{background:#1faa59}.u5E{background:#8a93a5}.u5D{background:#e23744}
.mov.show{display:flex}
.modal{position:relative;background:var(--surface);border:1px solid var(--bd);border-radius:16px;padding:18px;max-width:480px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.45);max-height:86vh;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--bar,#14a06a) transparent}
.modal::-webkit-scrollbar{width:8px}.modal::-webkit-scrollbar-thumb{background:var(--bar,#14a06a);border-radius:8px}
html{scrollbar-width:thin;scrollbar-color:var(--bar,#14a06a) transparent}.main{scrollbar-color:var(--bar,#14a06a) transparent}
::-webkit-scrollbar{width:11px;height:11px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bar,#14a06a);border-radius:8px;border:2px solid transparent;background-clip:content-box}::-webkit-scrollbar-thumb:hover{filter:brightness(1.1)}
.rnav{display:flex;align-items:center}.rnav .radar{margin-left:auto;width:9px;height:9px;border-radius:50%;background:#e0a008;box-shadow:0 0 0 0 rgba(224,160,8,.55);animation:radar 1.9s ease-out infinite;flex:none}
@keyframes radar{0%{box-shadow:0 0 0 0 rgba(224,160,8,.55)}70%{box-shadow:0 0 0 10px rgba(224,160,8,0)}100%{box-shadow:0 0 0 0 rgba(224,160,8,0)}}
.modal h3{margin:0 0 6px;font-size:16px;display:flex;align-items:center;gap:9px}
.mx{position:absolute;top:9px;right:11px;background:transparent;color:var(--mut);border:0;font-size:24px;line-height:1;cursor:pointer;padding:0 6px;font-weight:700}.mx:hover{color:var(--tx)}
.cols{display:flex;gap:16px;align-items:flex-start}.col{flex:1;min-width:0}
@media(max-width:680px){.cols{flex-direction:column}}
.rk{display:inline-block;background:var(--pri);color:#fff;border-radius:8px;padding:2px 9px;font-weight:800;font-size:12px}
.mr{display:flex;align-items:center;gap:9px;padding:9px 4px;border-bottom:1px solid var(--bd);font-size:13px}
.mr .flag{width:22px;height:16px}
.od{margin-left:auto;font-size:11px;color:var(--mut);text-align:right;white-space:nowrap}
.bdg{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff;flex:none}
.bV{background:#14794a}.bD{background:#c01f2e}.bE{background:#9a6b00}.b-{background:#9aa0ad}
.pf{width:26px;height:34px;object-fit:cover;border-radius:4px;background:var(--flagbg);flex:none}.pf.nopf{display:inline-flex;align-items:center;justify-content:center;font-size:15px;color:var(--mut)}
.lkbtn{display:inline-block;background:var(--surface2);color:var(--pri2);font-weight:700;font-size:11px;padding:4px 11px;border-radius:999px;text-decoration:none;white-space:nowrap;margin-left:8px}
.s365link{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:14px;padding:11px 10px;background:var(--rc,var(--pri));border:0;outline:0;border-radius:10px;color:#fff;font-weight:800;font-size:12px;text-decoration:none;box-shadow:0 6px 16px color-mix(in srgb,var(--rc,#1faa59) 30%,transparent);transition:.15s}.s365link:hover{filter:brightness(1.08);transform:translateY(-1px)}
.o365sm{height:19px;width:auto;border-radius:3px;cursor:pointer;transition:.15s}.o365sm:hover{transform:scale(1.12)}
.sbtn{background:var(--surface2);color:var(--pri2);border:0;border-radius:6px;width:26px;height:26px;font-size:12px;cursor:pointer;flex:none}.sbtn:hover{background:var(--pri);color:#fff}
.jfav{cursor:pointer}
.live365{position:relative;display:inline-flex;border-radius:50%}
.live365::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;animation:radar365 1.9s ease-out infinite}
@keyframes radar365{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--rc,#0e9488) 50%,transparent)}70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}
.brand{display:flex;align-items:center;gap:9px}
.blogo{height:30px;width:auto;display:block;flex:none;filter:drop-shadow(0 3px 8px rgba(0,0,0,.4))}
.burger{display:flex!important;align-items:center;justify-content:center;font-size:20px}
.side{transition:width .2s ease}
body.mcol .side{width:58px;padding:10px 6px}
body.mcol .side a{justify-content:center;font-size:0;gap:0;padding:10px 0}
body.mcol .side a .ic{font-size:18px}
body.mcol .side a .tag,body.mcol .side a .free{display:none}\nbody.mcol .side .radar{display:none}
.sbtn{background:var(--surface2);color:var(--rc,#1faa59)}
.sbtn:hover{background:color-mix(in srgb,var(--rc,#1faa59) 18%,var(--surface2));color:var(--rc,#1faa59)}
.su:hover{background:color-mix(in srgb,var(--rc,#1faa59) 18%,var(--surface2));color:var(--rc,#1faa59)}
.tag{color:var(--rc,#1faa59)}
.pl:focus{outline:none;border-color:var(--rc,#1faa59);box-shadow:0 0 0 3px color-mix(in srgb,var(--rc,#1faa59) 20%,transparent)}
.autobar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.pghead{border-left:3px solid var(--pri2);padding-left:12px;margin-bottom:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}.pghl{flex:1;min-width:200px}.pgsteps{margin-left:auto;width:235px;position:relative;z-index:3}.pgsteps-inner{display:flex;flex-direction:column;gap:5px;align-items:stretch;border:1px solid var(--bar,#14a06a);border-radius:10px;padding:7px 11px;background:var(--surface);position:relative;z-index:1}.fogos{position:absolute;inset:0;z-index:0;pointer-events:none}.fogos i{position:absolute;width:6px;height:6px;border-radius:50%;opacity:0;animation:fogo 2400ms ease-out infinite}@keyframes fogo{0%{transform:translate(0,0) scale(.4);opacity:0}12%{opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(1);opacity:0}}.stephead{display:flex;align-items:center;justify-content:space-between}.steppct{font-size:10px;font-weight:800;color:var(--mut)}.steprow{display:flex;align-items:center;justify-content:flex-start;gap:7px}.stepb{display:inline-flex;align-items:center;gap:5px;background:none;border:0;cursor:pointer;padding:0;font:inherit;font-size:12px;font-weight:800;line-height:1}.stepb .dot{width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1.6px solid currentColor}.stepb.done .dot{background:color-mix(in srgb,currentColor 22%,transparent);border-color:transparent}.stepb.active{color:var(--bar,#14a06a)}.stepb.active .dot{background:var(--bar,#14a06a);border-color:var(--bar,#14a06a)}.stepb.active .dot svg{stroke:#fff}.stepb:hover .dot{background:currentColor}.stepb:hover .dot svg{stroke:#fff}.stepbar{height:5px;border-radius:99px;background:var(--bd);overflow:hidden}.stepbar i{display:block;height:100%;width:0;background:var(--bar,#14a06a);border-radius:99px;transition:width .4s}
.rktop{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.rktop .tabs{margin-bottom:0}.rkrules{margin-left:auto;display:inline-flex;align-items:center;gap:6px;background:none;border:0;cursor:pointer;font-size:12.5px;font-weight:800;color:var(--mut)}.radar2{width:9px;height:9px;border-radius:50%;background:var(--rkc,#1faa59);box-shadow:0 0 0 0 color-mix(in srgb,var(--rkc,#1faa59) 55%,transparent);animation:radar2 1.9s ease-out infinite;flex:none}@keyframes radar2{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--rkc,#1faa59) 55%,transparent)}70%{box-shadow:0 0 0 10px transparent}100%{box-shadow:0 0 0 0 transparent}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}.steplab{font-size:10px;text-transform:uppercase;letter-spacing:.4px;color:var(--mut);font-weight:800;background:none;white-space:nowrap;flex:1 1 auto;text-align:left;min-width:0;overflow:hidden;text-overflow:ellipsis}.steplab.slfull{color:var(--bar,#14a06a);background:none}.step{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:800;white-space:nowrap}.stepsep{color:var(--bd);font-weight:400}.step svg{vertical-align:-1px}
.pghead h1{margin:0 0 5px;font-size:20px;line-height:1.15}
.pgchip{font-size:11.5px;font-weight:800;color:var(--bar,#14a06a);background:transparent;padding:0;vertical-align:middle;margin-left:7px}
.modal .btn:not(.ghost){background:var(--bar,#14a06a);box-shadow:0 4px 12px rgba(0,0,0,.18)}
.pgsub{margin:0;color:var(--mut);font-size:13px;line-height:1.5}
.actpanel{display:grid;grid-template-columns:1.05fr 0.95fr;gap:10px;align-items:center;background:var(--surface);border:1px solid var(--bd);border-radius:14px;padding:10px 12px;margin-bottom:14px}
.act-ia{display:flex;align-items:center;gap:10px;min-width:0}
.act-ia .bubble{flex:1;max-width:none;overflow:hidden;display:flex;align-items:center;gap:8px}
.act-logic{display:flex;align-items:center;gap:9px;min-width:0;padding-left:12px;border-left:1px solid var(--bd)}
#btn-auto{flex:1;height:38px;padding:0 16px;font-size:13px;border-radius:11px}
.sw{position:relative;display:inline-block;width:42px;height:24px;flex:none;cursor:pointer}
.sw input{opacity:0;width:0;height:0;position:absolute}
.sl{position:absolute;inset:0;background:var(--surface2);border:1px solid var(--bd);border-radius:999px;transition:.2s}
.sl:before{content:"";position:absolute;height:18px;width:18px;left:2px;top:2px;background:#fff;border-radius:50%;transition:.2s}
.sw input:checked+.sl{background:var(--rc,var(--pri));border-color:var(--rc,var(--pri))}
.sw input:checked+.sl:before{transform:translateX(18px)}
.swlbl{font-size:13px;font-weight:600;color:var(--mut)}
.qmark{width:22px;height:22px;border-radius:50%;background:var(--surface2);border:1px solid var(--bd);color:var(--mut);font-weight:800;font-size:12px;cursor:pointer;flex:none}.qmark:hover{background:var(--pri);color:#fff}
.autob{font-size:8px;font-weight:800;background:var(--surface2);color:var(--mut);padding:1px 5px;border-radius:6px;letter-spacing:.5px}
#s-ia input,#s-ia select{width:100%;background:var(--surface2);border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:10px;font-size:14px}
.ialbl{font-size:12px;color:var(--mut);font-weight:700;margin:10px 0 4px;display:block}
.iarow{display:flex;gap:8px;align-items:center;margin-top:12px;flex-wrap:wrap}
.mascbar{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--bd);border-radius:14px;padding:10px 12px;margin-bottom:12px}
.masc{width:46px;height:46px;flex:none;cursor:pointer;transition:filter .3s,opacity .3s}.masc svg{width:100%;height:100%;display:block}
.grow{flex:1;min-width:0}
.free{margin-left:auto;display:inline-flex;align-items:center;font-size:8px;font-weight:600;background:#d6f5e3;color:#0f7a45;padding:2px 6px;border-radius:6px;line-height:1}
.side{gap:1px}
.side a{padding:7px 10px;font-size:13px;border-radius:10px;gap:10px;transition:background .12s}
.side a .ic{width:20px;height:20px;display:flex;align-items:center;justify-content:center}
.side a .ic svg{width:19px;height:19px}
.side a.on{background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff;box-shadow:0 3px 10px rgba(31,170,89,.28)}
.sdiv{height:1px;background:var(--bd);margin:8px 8px}
.pwrap{position:relative;display:inline-flex;align-items:center}.pchev{position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:var(--card2);border:2px solid var(--panel);color:var(--tx);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3}.pchev svg{width:9px;height:9px;display:block}.pchev:hover{background:#d6f5e3;color:#0f7a45}
.av{overflow:hidden}
.av img{width:100%;height:100%;object-fit:cover;display:block}
.pdrop{position:absolute;top:46px;right:0;width:236px;background:var(--panel);border:1px solid var(--bd);border-radius:14px;box-shadow:0 18px 44px rgba(8,16,38,.32);padding:8px;display:none;flex-direction:column;gap:1px;z-index:60;backdrop-filter:blur(10px)}
.pdrop.open{display:flex;animation:fade .14s ease}
.pdhead{display:flex;align-items:center;gap:10px;padding:6px 8px 10px;border-bottom:1px solid var(--bd);margin-bottom:5px}
.pdhead .av{width:40px;height:40px;font-size:16px;cursor:default}
.pdhead b{font-size:14px;display:block;line-height:1.2}
.pdhead small{color:var(--mut);font-size:11px;display:block;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pdrop a{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:9px;font-size:13px;font-weight:600;color:var(--tx);cursor:pointer}
.pdrop a:hover{background:var(--card)}
.pdrop a svg{width:18px;height:18px;color:var(--mut)}
.pdrop a.dang{color:#e23744}.pdrop a.dang svg{color:#e23744}
.pdsep{height:1px;background:var(--bd);margin:6px 4px}.pdperfis{padding:2px 0}.pdperfil{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:9px;cursor:pointer}.pdperfil:hover{background:var(--card)}.pdperfil.ativo{background:var(--card2)}.pdpav{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pri2));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;flex:none}.pdpav.adm{background:linear-gradient(135deg,#e0a008,#f6c83a);color:#3a2a00}.pdpav svg{width:16px;height:16px}.pdpinfo{flex:1;min-width:0}.pdpinfo b{font-size:13px;display:block;color:var(--tx)}.pdpinfo small{font-size:11px;color:var(--mut)}.pdpchk{color:var(--pri2);font-weight:800}
.pdfoot{display:flex;align-items:center;gap:8px}
.pdfoot a{flex:1}
.thsw{display:inline-flex;gap:1px;background:var(--card2);border:0;border-radius:999px;padding:2px;flex:none}
.thbtn{width:23px;height:23px;border:0;background:none;border-radius:50%;color:var(--mut);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
.thbtn svg{width:13px;height:13px}
.thbtn.on{background:var(--pri);color:#fff}
.profwrap{max-width:560px}
.profhead{display:flex;align-items:center;gap:16px;margin-bottom:16px}
.profava{width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pri2));display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#fff;position:relative;overflow:hidden;flex:none;cursor:pointer}
.profava img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.profcam{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.55);color:#fff;font-size:9.5px;font-weight:700;text-align:center;padding:3px 0;letter-spacing:.3px;z-index:2}
.profmeta b{font-size:19px}
.full{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:#0f7a45;background:#d6f5e3;padding:2px 8px;border-radius:6px;margin-left:6px}
.proffield{margin-bottom:12px}
.proffield label{display:block;font-size:12px;color:var(--mut);font-weight:700;margin-bottom:5px}
.proffield input{width:100%;background:var(--card2);border:1px solid var(--bd);color:var(--tx);border-radius:10px;padding:10px 12px;font-size:14px}
.proffield input.ro{opacity:.65}
.profstats{display:flex;gap:10px;margin:16px 0}
.profstat{flex:1;background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:12px 8px;text-align:center}
.profstat .v{font-size:19px;font-weight:800}
.profstat .l{font-size:10.5px;color:var(--mut);font-weight:700;margin-top:2px}
.avov{position:fixed;inset:0;background:rgba(8,13,24,.72);display:none;align-items:center;justify-content:center;z-index:300;padding:16px}
.avov.on{display:flex}
.avbox{background:var(--surface,#fff);border:1px solid var(--bd);border-radius:18px;padding:18px 18px 16px;width:min(340px,92vw);text-align:center;box-shadow:0 22px 56px rgba(0,0,0,.45)}
.avtitle{font-weight:800;font-size:16px;margin-bottom:4px}
.avhint{font-size:12px;color:var(--mut);margin-bottom:14px}
.avframe{position:relative;width:248px;height:248px;margin:0 auto 14px;border-radius:50%;overflow:hidden;background:#0d1118;cursor:grab;touch-action:none;user-select:none}
.avframe.drag{cursor:grabbing}
.avframe img{position:absolute;max-width:none;-webkit-user-drag:none;user-select:none;pointer-events:none}
.avring{position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,.85) inset,0 0 0 9999px rgba(8,13,24,.35);pointer-events:none}
.avzwrap{display:flex;align-items:center;gap:10px;margin:0 4px 14px}
.avzoom{flex:1;-webkit-appearance:none;appearance:none;height:5px;border-radius:999px;background:var(--bd);outline:none}
.avzoom::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--pri);cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)}
.avzoom::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--pri);cursor:pointer;border:2px solid #fff}
.avacts{display:flex;gap:10px;justify-content:center}
.avacts .btn{flex:1}
.convlink input{width:100%;background:var(--surface2);border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:9px;font-size:12px;margin:4px 0 10px}
.convbtns{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.cbtn{display:flex;align-items:center;justify-content:center;gap:5px;border:0;border-radius:10px;padding:11px 6px;font-weight:800;font-size:12.5px;cursor:pointer;text-decoration:none}
.cbtn.zap{background:#25d366;color:#04321a}.cbtn.mail{background:#2f6fed;color:#fff}.cbtn.cp{background:var(--surface2);color:var(--tx);border:1px solid var(--bd)}
.bloqov{position:fixed;inset:0;background:var(--bgrad);display:none;align-items:center;justify-content:center;z-index:250;padding:18px}
.bloqcard{width:380px;max-width:94vw;background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:22px 20px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.bloqtitle{font-size:19px;font-weight:800;margin-bottom:4px}
.bloqor{color:var(--mut);font-size:12px;margin:12px 0;position:relative}
.bloqcode{display:flex;gap:8px}.bloqcode input{flex:1;min-width:0;background:var(--surface2);border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:10px;font-size:13px}
.masc.off{opacity:.85;filter:drop-shadow(0 2px 5px var(--rc,#14794a))}
.masc.on{animation:bob 2.4s ease-in-out infinite;filter:drop-shadow(0 4px 12px var(--rc,#14794a))}
.masc.think{animation:bob .55s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-6px) rotate(3deg)}}
.bubble{position:relative;background:var(--surface2);border:1px solid var(--bd);border-radius:12px;padding:8px 12px;font-size:12.5px;font-weight:600;flex:0 1 auto;max-width:360px;line-height:1.4}
.bubble:before{content:"";position:absolute;left:-7px;top:18px;border:7px solid transparent;border-right-color:var(--bd)}
.mascf{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mascbtnwrap{flex:0 0 auto;display:flex}\n.mbtn{background:var(--rc,#14794a);color:#fff;border:0;border-radius:8px;padding:7px 14px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap}
.mlink{color:var(--rc,#14794a);font-weight:800;cursor:pointer;letter-spacing:.2px;font-size:11px;white-space:nowrap}
.gstep{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--bd);font-size:13px;line-height:1.5}
.gnum{flex:none;width:24px;height:24px;border-radius:50%;background:var(--pri);color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}
.gopen{display:inline-flex;align-items:center;gap:6px;background:var(--pri);color:#fff;padding:8px 14px;border-radius:9px;font-weight:800;font-size:12px;text-decoration:none}
.gstep code{background:var(--surface2);padding:1px 5px;border-radius:5px}
.iarecs{margin-top:8px}
.recrow{display:flex;gap:8px;flex-wrap:wrap}
.rec{flex:1;min-width:155px;text-align:left;background:var(--surface2);border:1px solid var(--bd);border-radius:10px;padding:8px 11px;cursor:pointer;color:var(--tx);display:flex;flex-direction:column;gap:2px;transition:.15s}
.rec:hover{border-color:var(--pri);transform:translateY(-1px)}
.rec.sel{border-color:var(--pri);background:color-mix(in srgb,var(--pri) 14%,var(--surface2));box-shadow:0 4px 12px rgba(31,170,89,.18)}
.rec b{font-size:13px}.rec small{font-size:11px;color:var(--mut)}
.provgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:6px 0}
.provcard{background:var(--surface2);border:2px solid var(--bd);border-radius:11px;padding:10px 12px;cursor:pointer;display:flex;flex-direction:column;gap:2px;transition:.15s}
.provcard:hover{border-color:var(--pri)}
.provcard.sel{border-color:var(--pri);background:color-mix(in srgb,var(--pri) 12%,var(--surface2))}
.provcard b{font-size:13px}.provcard small{font-size:11px;color:var(--mut)}
.provgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:10px;margin:6px 0}
.provcard{position:relative;background:var(--surface2);border:2px solid var(--bd);border-radius:13px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:11px;transition:.15s;overflow:hidden}
.provcard:hover{border-color:var(--pri);transform:translateY(-2px)}
.provcard.sel{border-color:var(--pri);background:color-mix(in srgb,var(--pri) 12%,var(--surface2));box-shadow:0 6px 16px rgba(31,170,89,.18)}
.provcard .pico{font-size:24px;flex:none}
.provcard .pinfo{display:flex;flex-direction:column;gap:1px;min-width:0}.provcard .pinfo b{font-size:13.5px}.provcard .pinfo small{font-size:11px;color:var(--mut)}
.provcard.gem{border-color:var(--gold)}.provcard.gem.sel{border-color:var(--pri)}
.reco{position:absolute;top:0;right:0;background:linear-gradient(135deg,var(--gold),#e0a008);color:#1a1200;font-size:8px;font-weight:800;padding:3px 8px;border-bottom-left-radius:9px;letter-spacing:.3px}
.iarow.rgt{justify-content:flex-end}
.side a .lbl{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;text-align:left}body.mcol .side a .lbl{display:none}
.hmrod{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,rgba(31,170,89,.16),rgba(31,170,89,.05));border:1px solid rgba(31,170,89,.45);border-radius:14px;padding:14px 16px;margin-bottom:16px}.hmrobo{width:50px;height:50px;flex:none;animation:bob 2.6s ease-in-out infinite}.hmrbody{flex:1;min-width:0}.hmbubble{position:relative;display:inline-block;background:var(--surface2);border:1px solid var(--bd);border-radius:12px;padding:8px 13px;font-size:14px;font-weight:600;margin:10px 0 3px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}.hmchip{font-size:10px;font-weight:800;color:var(--pri2);text-transform:uppercase;letter-spacing:.4px}.hmbubble:before{content:'';position:absolute;left:-7px;top:14px;border:7px solid transparent;border-right-color:var(--bd)}.hmbubble b{color:var(--pri2)}.hmmeta{font-size:12px;color:var(--mut)}.hmmeta b{color:var(--tx)}.hmpos{display:flex;gap:7px;margin-top:3px}.hmpos>div{flex:1;text-align:center;background:var(--card2);border-radius:9px;padding:7px 3px}.hmpos .pv{display:block;font-size:16px;font-weight:800}.hmpos .pv.green{color:var(--pri2)}.hmpos .pl{display:block;font-size:9px;color:var(--mut);font-weight:700;text-transform:uppercase}.hmbar{height:8px;border-radius:99px;background:var(--card2);overflow:hidden;margin:3px 0 7px}.hmbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--pri),var(--pri2));border-radius:99px;transition:width .9s ease}.hmkptag{color:var(--pri2);font-weight:800;cursor:pointer}.hmpote{color:#3a2a00;background:linear-gradient(135deg,#f8d873,#e0a008);border:1px solid #e6ad12;position:relative;overflow:hidden;font-weight:800}.hmpote #hm-pote{color:#3a2a00;font-weight:800}.hmpote::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.6) 50%,transparent 62%);transform:translateX(-120%);animation:potshine 3s ease-in-out infinite;pointer-events:none}@keyframes potshine{0%{transform:translateX(-120%)}55%,100%{transform:translateX(120%)}}.newswrap{position:relative}.hmsino{position:relative;width:36px;height:36px;border-radius:50%;background:var(--card2);border:1px solid var(--bd);color:var(--tx);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;flex:none}.hmsino:hover{background:var(--card)}.hmsbadge{display:none;position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;border-radius:9px;background:var(--no);color:#fff;font-size:9px;font-weight:800;align-items:center;justify-content:center;padding:0 4px;animation:nbadge 1.4s infinite}.hmsbadge.on{display:flex}@keyframes nbadge{0%{box-shadow:0 0 0 0 rgba(226,55,68,.6)}70%{box-shadow:0 0 0 7px rgba(226,55,68,0)}100%{box-shadow:0 0 0 0 rgba(226,55,68,0)}}.newsdrop{position:absolute;top:46px;right:0;width:300px;max-height:380px;overflow-y:auto;background:var(--panel);border:1px solid var(--bd);border-radius:14px;box-shadow:0 18px 44px rgba(8,16,38,.4);padding:8px;display:none;z-index:60;backdrop-filter:blur(10px)}.newsdrop.open{display:block}.newshd{font-size:11px;font-weight:800;color:var(--mut);text-transform:uppercase;letter-spacing:.5px;padding:6px 8px 8px}.newsitem{display:flex;gap:9px;align-items:flex-start;padding:8px;border-radius:9px}.newsitem:hover{background:var(--card)}.newsic{width:30px;height:30px;border-radius:8px;background:var(--card2);display:flex;align-items:center;justify-content:center;flex:none;font-size:15px}.newsbd{flex:1;min-width:0}.newsbd b{font-size:12px;display:block}.newsbd small{font-size:12px;color:var(--mut)}.newsbd .nwhen{font-size:10px;color:var(--mut);margin-top:2px}@media(max-width:760px){.hmest{display:none}.brand .bmgr{display:none}.wallets{gap:5px}.hmpote{font-size:11px}}.hmkpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.hmkpi{background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:13px 15px}.hmkpi h3{font-size:11px;color:var(--mut);font-weight:700;margin:0 0 4px}.hmkpi .stat{font-size:26px;font-weight:800;line-height:1}.hmkpi .stat.green{color:var(--pri2)}.hmcols{display:grid;grid-template-columns:1.02fr .98fr;gap:16px;align-items:start}.hmfwrap{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--bd)}.hmfield{display:block;width:100%}body.light .hmpitch{fill:#1a8f54}body.light .hmlines{stroke:#bfe6d2}.hmshine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.10) 50%,transparent 58%);transform:translateX(-100%);animation:hmshine 4.8s ease-in-out infinite;pointer-events:none}@keyframes hmshine{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}.hmpx-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.hmpx-head h3{font-size:11px;color:var(--pri2);font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin:0}.hmpx-arw{width:26px;height:26px;border-radius:50%;background:var(--card2);border:1px solid var(--bd);color:var(--tx);font-size:15px;cursor:pointer;line-height:1;flex:none}.hmpx-arw:hover{background:var(--pri);color:#fff;border-color:var(--pri)}.hmpx-slot{min-height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:6px 4px}.hmpx-game{display:flex;align-items:center;justify-content:center;gap:9px;width:100%}.hmpx-game .flag{width:30px;height:22px;border-radius:3px;flex:none}.hmpx-tm{font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:115px;text-align:center}.hmpx-x{font-size:11px;color:var(--mut);font-weight:800;flex:none}.hmpx-when{font-size:12px;color:var(--mut)}.hmpx-dots{display:flex;gap:5px;justify-content:center;margin-top:8px}.hmpx-dots i{width:6px;height:6px;border-radius:50%;background:var(--bd)}.hmpx-dots i.on{background:var(--pri2);width:15px;border-radius:3px}@keyframes hmpxfade{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}.hmprev .btn{box-shadow:0 10px 26px rgba(0,0,0,.5),0 4px 14px rgba(31,170,89,.55);font-size:14px;padding:12px 22px}.hmprev{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;background:radial-gradient(circle at 50% 45%,rgba(8,13,24,.32),rgba(8,13,24,.62))}.hmprev .soon{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--gold);background:rgba(245,196,81,.16);border:1px solid rgba(245,196,81,.5);border-radius:999px;padding:3px 11px;margin-bottom:8px}.hmprev b{font-size:15px;color:#fff}.hmprev span{font-size:12px;color:#c3ccd9;max-width:230px;margin:3px 0 12px}@media(max-width:680px){.hmkpis{grid-template-columns:1fr 1fr}.hmcols{grid-template-columns:1fr}}\n.unbox{position:fixed;inset:0;z-index:600;background:radial-gradient(circle at 50% 38%,rgba(8,40,26,.93),rgba(4,7,14,.98));display:none;align-items:center;justify-content:center;flex-direction:column;padding:20px;text-align:center;overflow:hidden}.unbox.on{display:flex}.unbox::before{content:"";position:absolute;left:50%;top:42%;width:170vmax;height:170vmax;transform:translate(-50%,-50%);z-index:0;pointer-events:none;background:conic-gradient(from 0deg,rgba(8,60,36,0),rgba(22,125,74,.32),rgba(8,60,36,0),rgba(22,125,74,.32),rgba(8,60,36,0));animation:ubgspin 26s linear infinite}.unbox::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 50% 42%,rgba(26,135,82,.34),rgba(4,7,14,0) 58%);animation:ubgpulse 5.5s ease-in-out infinite}@keyframes ubgspin{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes ubgpulse{0%,100%{opacity:.55}50%{opacity:1}}.ubok{position:absolute;z-index:0;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(245,222,150,.45),rgba(245,196,81,0) 70%);filter:blur(2px);animation:ubokf 9s ease-in-out infinite}@keyframes ubokf{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-34px) scale(1.15)}}.uhead{position:relative;z-index:5;font-size:27px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;margin-bottom:14px;background:linear-gradient(180deg,#fff7cf,#f5c451 55%,#d6951c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 2px 10px rgba(245,196,81,.45));opacity:0}.uburst{position:absolute;left:50%;top:46%;width:560px;height:560px;transform:translate(-50%,-50%);pointer-events:none;z-index:1;background:radial-gradient(circle,rgba(255,214,120,.55),rgba(255,170,40,.16) 38%,transparent 64%)}.uburst::before{content:"";position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,224,140,0) 0deg 9deg,rgba(255,224,140,.32) 9deg 13deg);-webkit-mask:radial-gradient(circle,#000 16%,rgba(0,0,0,.45) 42%,transparent 70%);mask:radial-gradient(circle,#000 16%,rgba(0,0,0,.45) 42%,transparent 70%);animation:uspin 16s linear infinite}@keyframes uspin{to{transform:rotate(360deg)}}.upack{position:relative;z-index:2;width:min(64vw,238px);cursor:pointer;filter:drop-shadow(0 20px 42px rgba(0,0,0,.6)) drop-shadow(0 0 26px rgba(255,200,80,.55));animation:upackfloat 3.4s ease-in-out infinite}.upack img{width:100%;display:block}@keyframes upackfloat{0%,100%{transform:translateY(0) rotate(-2.5deg)}50%{transform:translateY(-15px) rotate(2.5deg)}}.usp{position:absolute;z-index:1;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle,#fff,#f5c451 60%,rgba(245,196,81,0));bottom:24%;opacity:0;pointer-events:none;animation:usprise 2.9s ease-in infinite}@keyframes usprise{0%{opacity:0;transform:translateY(10px) scale(.4)}15%{opacity:1}100%{opacity:0;transform:translateY(-260px) scale(1.1)}}.uflash{position:absolute;inset:0;z-index:3;background:radial-gradient(circle at 50% 46%,rgba(255,255,255,.95),rgba(255,255,255,0) 45%);opacity:0;pointer-events:none}.btn.btn-off{background:#2a3340;color:#8a93a3;cursor:default;box-shadow:none;opacity:.75}.btn.btn-off:hover{transform:none}.pkgar{font-size:11px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:var(--pri2);margin-bottom:8px}.pkchips{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:2px}.pkchips span{display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:3px 8px;font-size:10px;font-weight:700;color:#cfd6e2}.pkchips span b{color:#fff;font-size:12px}.mkpac{width:150px;display:block;margin:2px auto 8px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.5))}.utap{position:relative;z-index:5;color:#fff;font-size:14px;font-weight:700;letter-spacing:.4px;margin-top:18px;opacity:.92;animation:upulse 1.3s infinite}@keyframes upulse{0%,100%{opacity:.9}50%{opacity:.35}}.ucards{position:relative;z-index:5;display:flex;gap:11px;flex-wrap:wrap;justify-content:center;align-content:center;max-width:700px;perspective:1000px}.ucard{width:110px;height:154px;border-radius:9px;overflow:hidden;border:1px solid rgba(255,255,255,.25);background:#0a3d2e;box-shadow:0 8px 22px rgba(0,0,0,.5);opacity:0}.ucard img{width:100%;height:100%;object-fit:cover;display:block}.ubtnfim{position:relative;z-index:5;margin-top:24px;opacity:0}/* ===== CAMPO PRO + cartas ===== */.pitch{position:relative;width:100%;aspect-ratio:68/100;border-radius:16px;overflow:hidden;isolation:isolate;background-color:#1f9d52;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23g)' opacity='0.16'/%3E%3C/svg%3E"),linear-gradient(180deg,#34b86a,#1f9d52 55%,#168843);background-size:150px 150px,100% 100%;box-shadow:inset 0 0 120px rgba(0,0,0,.42),0 14px 34px rgba(0,0,0,.4)}.pitch::before{content:"";position:absolute;inset:0;z-index:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 12.5%,rgba(0,0,0,.05) 12.5% 25%)}.pitch::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(120% 70% at 50% -6%,rgba(255,255,255,.26),rgba(255,255,255,0) 52%),radial-gradient(140% 100% at 50% 118%,rgba(0,0,0,.5),rgba(0,0,0,0) 58%)}.pitchlines{position:absolute;inset:0;z-index:1;width:100%;height:100%}.plr{position:absolute;z-index:2;transform:translate(-50%,-50%);width:var(--cw,15.5%);cursor:pointer;transition:transform .16s ease}.plr img{width:100%;display:block;border-radius:7px;filter:drop-shadow(0 8px 11px rgba(0,0,0,.6)) drop-shadow(0 2px 3px rgba(0,0,0,.45))}.plr .plrname{position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);background:rgba(8,14,24,.92);color:#fff;font-size:8.5px;font-weight:700;line-height:1.4;padding:1px 6px;border-radius:6px;white-space:nowrap;max-width:150%;overflow:hidden;text-overflow:ellipsis;pointer-events:none;box-shadow:0 2px 5px rgba(0,0,0,.4)}.plr:hover{transform:translate(-50%,-50%) scale(1.1) translateY(-3px);z-index:6}.plr.sel img{filter:drop-shadow(0 0 6px #f5c451) drop-shadow(0 8px 11px rgba(0,0,0,.6));animation:plrsel 1s ease infinite}@keyframes plrsel{0%,100%{transform:none}50%{transform:translateY(-3px)}}.plr.empty{cursor:default}.plr.empty .pslot{width:64%;margin:0 auto;aspect-ratio:1/1.34;border-radius:8px;border:1.5px dashed rgba(255,255,255,.55);background:rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center}.plr.empty .pslot span{font-size:10px;font-weight:800;color:rgba(255,255,255,.85);letter-spacing:.5px}.pitch.tmbig{--cw:16.5%}/* ===== Meu Time ===== */.tmtop{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}.tmbadge{display:flex;align-items:center;gap:8px;background:var(--card2);border:1px solid var(--bd);border-radius:12px;padding:9px 14px}.tmbadge .k{font-size:10px;color:var(--mut);font-weight:700;text-transform:uppercase;letter-spacing:.5px}.tmbadge .v{font-size:20px;font-weight:800;line-height:1;color:var(--tx)}.tmbadge .v.gold{color:var(--gold)}.tmgrid{display:grid;grid-template-columns:.82fr 1.18fr;gap:18px;align-items:start}.xfig{flex:none;width:30px;border-radius:5px;display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}#tm-xi{display:flex;flex-direction:column;gap:6px}.xrow{display:flex;align-items:center;gap:8px;background:var(--card2);border:1px solid var(--bd);border-radius:9px;padding:3px 8px;cursor:pointer;transition:border-color .12s,transform .12s}.xrow:hover{border-color:var(--pri);transform:translateX(2px)}.xrow.sel{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}.xpos{flex:none;width:28px;font-size:9.5px;font-weight:800;color:var(--mut);text-align:center;letter-spacing:.3px}.xovbox{flex:none;display:flex;flex-direction:column;align-items:center;gap:0}.xovbox i{font-style:normal;font-size:7px;font-weight:800;color:var(--mut);letter-spacing:.4px;line-height:1}.xov{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px}.xinfo{flex:1 1 auto;min-width:62px;display:flex;flex-direction:column;line-height:1.18}.xinfo b{font-size:12px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.15}.xinfo small{font-size:10px;color:var(--mut);display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.15}.xinfo small .flag{width:16px;height:11px;border-radius:2px;flex:none}.xstats{flex:none;display:grid;grid-template-columns:repeat(3,auto);gap:0 8px}.xst{display:flex;gap:3px;align-items:baseline}.xst i{color:var(--mut);font-style:normal;font-weight:700;font-size:8px;width:18px}.xst b{color:var(--tx);font-weight:800;font-size:10px;line-height:1.35}.tmbench h3{font-size:13px;margin:0 0 10px;color:var(--tx)}.bgrp{margin-bottom:14px}.bgrp h4{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--pri2);font-weight:800;margin:0 0 7px;display:flex;align-items:center;gap:6px}.bgrp h4 span{background:var(--card2);border:1px solid var(--bd);border-radius:999px;padding:1px 7px;font-size:10px;color:var(--mut)}.brow{display:flex;gap:9px;flex-wrap:wrap}.bcard{position:relative;width:62px;cursor:pointer;transition:transform .14s}.bcard img{width:100%;display:block;border-radius:7px;filter:drop-shadow(0 5px 8px rgba(0,0,0,.45))}.bcard:hover{transform:translateY(-3px) scale(1.05)}.bcard b{position:absolute;top:3px;right:3px;background:#0b1a12;color:#f5c451;font-size:10px;font-weight:800;border-radius:5px;padding:1px 4px;line-height:1.2}.bnone{font-size:12px;color:var(--mut);padding:6px 2px}@media(max-width:760px){.tmgrid{grid-template-columns:1fr}}
@media(min-width:761px) and (max-width:1024px){body{zoom:.82}.layout{min-height:calc(100vh / 0.82 - 52px)}.side{min-height:calc(100vh / 0.82 - 52px)}}
@media(min-width:1025px) and (max-width:1280px){body{zoom:.9}.layout{min-height:calc(100vh / 0.9 - 52px)}.side{min-height:calc(100vh / 0.9 - 52px)}}`;
