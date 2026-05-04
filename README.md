# Pinball

Dieses Projekt ist ein browserbasiertes 3D-Pinball-Spiel, das mit Three.js und Cannon.js entwickelt wurde.

## Voraussetzungen

Um das Projekt lokal auszuführen, benötigst du:
- [Visual Studio Code (VS Code)](https://code.visualstudio.com/)
- Die VS Code Erweiterung **"Live Server"** (von Ritwick Dey). 
  *(Dies ist wichtig, da einige 3D-Modelle, Texturen oder Module aufgrund von CORS-Richtlinien des Browsers nicht geladen werden können, wenn man die `index.html` einfach per Doppelklick öffnet).*

## Lokale Ausführung (Schritt-für-Schritt)

1. **Projekt öffnen:**
   Öffne den Projektordner (`pin_ball`) in Visual Studio Code.

2. **Live Server installieren (falls noch nicht vorhanden):**
   - Gehe in VS Code links im Menü auf **Erweiterungen** (oder drücke `Ctrl+Shift+X`).
   - Suche nach `Live Server`.
   - Klicke auf **Installieren** bei der Erweiterung von "Ritwick Dey".

3. **Projekt starten:**
   - Öffne die Datei `index.html` im Editor.
   - Mache einen **Rechtsklick** irgendwo in den Code der `index.html`.
   - Wähle im Kontextmenü **"Open with Live Server"** aus.
   - *Alternativ:* Klicke unten rechts in der blauen Statusleiste von VS Code auf **"Go Live"**.

4. **Im Browser ansehen:**
   - Dein Standardbrowser sollte sich nun automatisch öffnen.
   - Das Spiel ist in der Regel unter folgender URL erreichbar: 
     **[http://127.0.0.1:5500/index.html](http://127.0.0.1:5500/index.html)**
     *(Je nach Konfiguration kann der Port abweichen, z.B. `5501` oder `5502`)*
