"""Render a garden drive CSV from profile_garden_drive.mjs.

uv run --with matplotlib python tools/plot_garden_profile.py garden-drive.csv garden-drive.png [previous.csv]
"""
import csv
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager, ticker

def render(source, target, previous=None):
    with Path(source).open(encoding="utf-8") as stream:
        rows = list(csv.DictReader(stream))
    route = {key: [float(row[key]) for row in rows]
             for key in ("distance_m", "surface_y_m", "terrain_y_m")}
    stations = {row["station"]: (float(row["distance_m"]), float(row["surface_y_m"]))
                for row in rows if row["station"]}
    plt.rcParams["font.family"] = ["Apple SD Gothic Neo", "Noto Sans CJK KR", "sans-serif"]
    # Apple distributes the Korean face in a TTC outside matplotlib's default cache.
    font = Path("/System/Library/Fonts/AppleSDGothicNeo.ttc")
    if font.exists():
        font_manager.fontManager.addfont(str(font))
        plt.rcParams["font.family"] = font_manager.FontProperties(fname=str(font)).get_name()
    ink, green, amber = "#172d3a", "#337865", "#a14f24"
    fig, ax = plt.subplots(figsize=(12.5, 6.25), layout=None)
    fig.subplots_adjust(left=.071, right=.962, bottom=.235, top=.76)
    fig.text(.07,.91,"데빌스도어를 거쳐 JW 발레까지", fontsize=23, weight="bold", color=ink)
    fig.text(.071,.855,"버스 주차장 사잇길에서 출발해 식당 문 앞을 경유한 로컬 지도의 종단면", fontsize=13, color="#40545d")
    x = route["distance_m"]
    # Source spot heights and model data use the terminal origin as a common tie.
    datum = float(rows[0]["surface_elevation_m"])-float(rows[0]["surface_y_m"])
    ground = [v+datum for v in route["terrain_y_m"]]
    surface = [v+datum for v in route["surface_y_m"]]
    entry = stations["식당 주차장 진입"][0]
    rejoin = stations["주차장 진입로 복귀"][0]
    ax.axvspan(entry, rejoin, color="#f5efe6", alpha=.7, linewidth=0)
    ax.plot(x, surface, color=ink, linewidth=2.7, label="수정한 이동면")
    if previous:
        with Path(previous).open(encoding="utf-8") as stream:
            old=list(csv.DictReader(stream))
        ax.plot([float(row["distance_m"]) for row in old],
                [float(row["surface_y_m"])+datum for row in old],
                color="#b78769",linewidth=1.8,label="수정 전 이동면")
    ax.plot(x,ground,color=green,linewidth=1.45,linestyle=(0,(4,2)),label="서울시 자료에서 보간한 지형")
    ax.set_xlim(x[0]-5,x[-1]+8)
    ax.set_ylim(7.9,32.4)
    labels = [("버스 주차장 사잇길", (2,18),"left"),
              ("데빌스도어 문턱",(0,13),"center"),
              ("JW 발레 승하차점",(-4,13),"right")]
    for name, offset, align in labels:
        distance,elevation=stations[name]
        elevation+=datum
        ax.scatter(distance,elevation,s=32,color=ink,edgecolor="white",linewidth=.8,zorder=4)
        ax.annotate(f"{name}  {elevation:.1f} m", (distance,elevation),
                    xytext=offset,textcoords="offset points",ha=align,fontsize=10,color=ink,
                    arrowprops={"arrowstyle":"-","color":"#88989e","lw":.6,"shrinkA":2,"shrinkB":3},
                    bbox={"boxstyle":"round,pad=.18","fc":"white","ec":"none","alpha":.85})
    # On its westbound leg, the collector passes 0.30 m from this F002 spot.
    collector=min((row for row in rows if float(row["distance_m"])>rejoin),
                  key=lambda row:(float(row["x_m"])-329.81)**2+(float(row["z_m"])-71.89)**2)
    control_x=float(collector["distance_m"])
    ax.scatter(control_x,17.80,marker="D",s=44,fc="#9b461e",ec="white",zorder=5)
    ax.annotate("차로 옆 표고점  17.80 m",(control_x,17.8),xytext=(14,-27),
                textcoords="offset points",fontsize=10,color=amber,
                bbox={"fc":"white","ec":"none","pad":1.2},
                arrowprops={"arrowstyle":"-","lw":.8,"color":amber})
    ax.text((entry+rejoin)/2,31.0,"식당 진입로 왕복",color=amber,ha="center",fontsize=10)
    ax.set_axisbelow(True)
    ax.yaxis.set_major_locator(ticker.MultipleLocator(5))
    ax.xaxis.set_major_locator(ticker.MultipleLocator(100))
    ax.grid(axis="y",color="#d9e0e1",linewidth=.7)
    ax.tick_params(colors="#53656c",labelsize=10,length=0,pad=6)
    for edge in ("top","right","left"): ax.spines[edge].set_visible(False)
    ax.spines["bottom"].set_color("#b4c1c4")
    ax.set_ylabel("표고 (m)",color=ink,labelpad=7,fontsize=11)
    ax.set_xlabel("출발점부터 이동한 거리 (m)",color=ink,labelpad=9,fontsize=11)
    ax.legend(loc="upper left",bbox_to_anchor=(0,1.12),ncol=3,frameon=False,fontsize=11,handlelength=2.6)
    fig.text(.071,.093,"실선은 같은 동선을 따라 지도에서 추출한 높이입니다. 점선은 서울시 등고선·표고점을 25 m 간격으로 보간한 값입니다.",
             color="#41545c",fontsize=10)
    fig.text(.071,.052,"높이는 원본 표고 기준으로 환산했습니다. 차로 표고점은 중심선에서 0.3 m 떨어져 있습니다. 문턱과 발레 상판 높이는 인근 자료로 맞춘 추정값입니다.",
             color="#41545c",fontsize=10)
    fig.savefig(target,dpi=150,facecolor="white")
    plt.close(fig)

if __name__ == "__main__":
    render(*sys.argv[1:])
