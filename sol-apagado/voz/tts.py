import asyncio, json, sys, edge_tts
text = open("guion.txt", encoding="utf-8").read().replace("\n", " ")
voice, rate = sys.argv[1], sys.argv[2]
async def main():
    c = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    words = []
    with open("voz.mp3", "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"w": ch["text"], "t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7})
    json.dump(words, open("palabras.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(len(words), "palabras")
asyncio.run(main())
