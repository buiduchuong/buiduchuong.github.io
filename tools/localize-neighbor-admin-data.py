from pathlib import Path

p=Path('neighbor-country-outlines.js')
s=p.read_text(encoding='utf-8')
repls={
"https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CHN/ADM1/geoBoundaries-CHN-ADM1_simplified.geojson":"map-assets/neighbors/CHN-ADM1.geojson",
"https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/LAO/ADM1/geoBoundaries-LAO-ADM1_simplified.geojson":"map-assets/neighbors/LAO-ADM1.geojson",
"https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/KHM/ADM1/geoBoundaries-KHM-ADM1_simplified.geojson":"map-assets/neighbors/KHM-ADM1.geojson",
"stroke:'#aeb6bd','stroke-width':'0.82',opacity:'.58'":"stroke:'#969fa8','stroke-width':'1.08',opacity:'.82'",
}
for old,new in repls.items():
    if old in s:
        s=s.replace(old,new)
    elif new not in s:
        raise SystemExit(f'missing expected anchor: {old[:80]}')
p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if "neighbor-country-outlines.js?v=2" in s:
    s=s.replace("neighbor-country-outlines.js?v=2","neighbor-country-outlines.js?v=3",1)
elif "neighbor-country-outlines.js?v=3" not in s:
    raise SystemExit('neighbor cache anchor missing')
p.write_text(s,encoding='utf-8')
