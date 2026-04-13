# Portfolio Prompt Builder: Strategie- und Parameterlogik

Diese Datei dokumentiert die fachliche Logik der App in Bezug auf gewählte Strategien, Parameter, automatische Anpassungen und Plausibilitätsprüfungen.

## Default-Zustand

- `Base currency`: `CHF`
- `Risk appetite`: `High`
- `Investment horizon`: `>=10 years`
- `Equity allocation range`: `75% bis 95%`
- `Preferred exchange`: `SIX Swiss Exchange`
- `Target ETF positions`: `7 bis 11`
- `Language`: `English`
- Alle Anlageklassen ausser `Listed Real Estate` sind standardmässig ausgewählt, entsprechend dem `Growth`-Preset.
- Alle Ausgabeabschnitte `A` bis `G` sind standardmässig ausgewählt.
- Prompt-Instruktionen für Home Bias, Hedging, Look-through und synthetische ETFs sind standardmässig aktiv.

Der Reset-Button ist entsprechend beschriftet als `Reset defaults: Growth CHF` bzw. `Zurücksetzen: Wachstum CHF`.

## Investment Strategy Presets

Die Presets setzen Risikoappetit, Anlagehorizont, Aktienbandbreite und teilweise Anlageklassen/ETF-Zielanzahl.
Diese Werte werden in `config.js` gepflegt, damit sie ohne Eingriff in die App-Logik angepasst werden können.

| Preset | Risikoappetit | Anlagehorizont | Aktienbandbreite | Besondere Logik |
| --- | --- | --- | --- | --- |
| Conservative / Konservativ | `Low` | `>=3 years` | `25% bis 45%` | `Cash`, `Bonds`, `Equities` und `Commodities` werden aktiviert; `Listed Real Estate` und `Crypto Assets` werden abgewählt; ETF-Zielanzahl wird auf `6 bis 10` gesetzt; ETF-Status bleibt `Auto`. |
| Balanced / Ausgewogen | `Balanced` | `>=5 years` | `55% bis 75%` | `Crypto Assets` und `Listed Real Estate` werden abgewählt; ETF-Zielanzahl wird im Auto-Modus neu auf Basis der Anlageklassen berechnet. |
| Growth / Wachstum | `High` | `>=10 years` | `75% bis 95%` | `Listed Real Estate` wird abgewählt, `Crypto Assets` bleibt aktiviert; ETF-Zielanzahl wird im Auto-Modus neu auf Basis der Anlageklassen berechnet. |
| Aggressive / Aggressiv | `Very high` | `>=10 years` | `90% bis 100%` | `Bonds` werden abgewählt, `Listed Real Estate` und `Crypto Assets` bleiben aktiviert; ETF-Zielanzahl wird im Auto-Modus neu auf Basis der Anlageklassen berechnet. |

Die Preset-Beschreibung zeigt die Aktienbandbreite explizit als `XX-XX% equity` bzw. `XX-XX% Aktien`.

## Konfiguration in `config.js`

`config.js` enthält die fachlich editierbaren Werte:

- `presets`: Strategieprofile inklusive Risikoappetit, Anlagehorizont, Aktienbandbreite, ETF-Zielanzahl-Overrides und Anlageklassen.
- `label` und `deLabel`: sichtbare Strategienamen; `id` kann ebenfalls angepasst werden, wenn `defaultPresetId` und Referenzen auf die neue ID zeigen.
- `icon`: Icon-Stil des Presets (`conservative`, `balanced`, `growth`, `aggressive`).
- `exchanges`: die im Feld `Preferred exchange` auswählbaren Börsenplätze.
- `defaultBaseCurrency`: Basiswährung für Initialzustand und Reset.
- `defaultExchangeByCurrency`: Default-Börsenplatz pro Basiswährung.
- `defaultPresetId`: Preset für Initialzustand und Reset.

Wenn die App auf WordPress/Plesk veröffentlicht wird, muss `config.js` zusammen mit `index.html`, `styles.css` und `app.js` hochgeladen werden.

## Risk Appetite und Aktienbandbreite

Wenn `Equities` ausgewählt ist, wird die Aktienbandbreite automatisch nach Risikoappetit gesetzt:

| Risikoappetit | Aktienbandbreite |
| --- | --- |
| `Low` | `25% bis 45%` |
| `Moderate` | `40% bis 60%` |
| `Balanced` | `55% bis 75%` |
| `High` | `75% bis 95%` |
| `Very high` | `90% bis 100%` |

Wenn `Equities` abgewählt wird:

- Die Aktienbandbreite wird automatisch auf `0% bis 0%` gesetzt.
- Der Status bleibt `Auto`.
- Plus-/Minus-Buttons können die Aktienquote nicht erhöhen, solange `Equities` abgewählt ist.
- Ein Wechsel des Risikoappetits erhöht die Aktienquote ebenfalls nicht, solange `Equities` abgewählt ist.
- Wenn `Equities` wieder angewählt wird, wird die Aktienbandbreite wieder passend zum aktuellen Risikoappetit gesetzt.

Wenn der Nutzer die Aktienquote über Plus-/Minus-Buttons manuell ändert:

- Der Status wechselt auf `Manual`.
- Ein Wechsel des Risikoappetits setzt die Aktienbandbreite wieder auf den passenden Auto-Wert und der Status wird wieder `Auto`.
- Ein Klick auf `Manual` stellt ebenfalls wieder auf den passenden Auto-Wert zurück.

## ETF-Zielanzahl

Basiswert für die Auto-Berechnung:

- `8 bis 12` ETF-Positionen.

Da der Default-Zustand dem `Growth`-Preset entspricht und `Listed Real Estate` abgewählt ist, startet die App effektiv mit:

- `7 bis 11` ETF-Positionen.

Solange der Nutzer die ETF-Zielanzahl nicht manuell geändert hat:

- Jede abgewählte Nicht-Aktien-Anlageklasse reduziert Minimum und Maximum um `1`.
- Wenn `Equities` abgewählt wird, reduziert dies Minimum und Maximum um `5`.
- Die minimale ETF-Anzahl wird nie unter `1` gesetzt.
- Das Maximum wird nie kleiner als das Minimum.

Wenn der Nutzer die ETF-Zielanzahl über Plus-/Minus-Buttons manuell ändert:

- Der Status wechselt auf `Manual`.
- Weitere Anlageklassenänderungen passen die ETF-Zielanzahl nicht automatisch an.
- Ein Klick auf `Manual` stellt zurück auf Auto und berechnet die ETF-Zielanzahl anhand der aktuell ausgewählten Anlageklassen neu.

Beim `Conservative`-Preset:

- `Listed Real Estate` und `Crypto Assets` werden abgewählt.
- `Cash`, `Bonds`, `Equities` und `Commodities` werden aktiviert.
- Die ETF-Zielanzahl wird automatisch auf `6 bis 10` gesetzt.
- Der ETF-Status bleibt `Auto`.

Wenn danach `Balanced`, `Growth` oder `Aggressive` gewählt wird:

- `Balanced` aktiviert `Bonds` und `Equities`, lässt aber `Listed Real Estate` und `Crypto Assets` abgewählt.
- `Growth` aktiviert `Bonds`, `Equities` und `Crypto Assets`, lässt aber `Listed Real Estate` abgewählt.
- `Aggressive` aktiviert `Equities`, `Listed Real Estate` und `Crypto Assets`, lässt aber `Bonds` abgewählt.
- Im Auto-Modus wird die ETF-Zielanzahl aus den ausgewählten Anlageklassen neu berechnet.

## Base Currency und Preferred Exchange

Die Börse wird im Auto-Modus aus der Basiswährung abgeleitet:

| Basiswährung | Auto-Börse |
| --- | --- |
| `CHF` | `SIX Swiss Exchange` |
| `EUR` | `XETRA Deutsche Börse` |
| `USD` | `SIX Swiss Exchange` |
| `GBP` | `LSE London Stock Exchange` |

Wenn der Nutzer `Preferred exchange` manuell ändert:

- Der Status wechselt auf `Manual`.
- Ein späterer Währungswechsel ändert die Börse nicht mehr automatisch.
- Ein Klick auf `Manual` stellt zurück auf `Auto` und setzt die Börse passend zur aktuellen Basiswährung.

## Home Bias und Aktienregionen

Die Home-Bias-Logik hängt von der Basiswährung ab:

| Basiswährung | Home-Bias-Logik |
| --- | --- |
| `CHF` | Schweizer Home Bias wird adressiert; Aktienregionen enthalten `Europa ex CH` und `Schweiz (CH)` separat. |
| `EUR` | Europäischer Home Bias wird adressiert; Europa enthält die Schweiz innerhalb Europas. |
| `GBP` | Britischer Home Bias wird adressiert; Europa enthält die Schweiz innerhalb Europas. |
| `USD` | Home-Bias-Checkbox wird ausgeblendet; keine Home-Bias-Anforderung wird in den Prompt geschrieben. |

## Sprache und Range-Anzeige

Die UI- und Prompt-Sprache kann zwischen `English` und `German` gewählt werden.

Für Range-Anzeigen gilt:

- Englisch: `55% to 75%`, `8 to 12`
- Deutsch: `55% bis 75%`, `8 bis 12`

Wenn Minimum und Maximum identisch sind:

- Englisch: `Equity allocation: 75%` bzw. `Target exactly 8 positions`
- Deutsch: `Aktienquote: 75%` bzw. `Ziel: genau 8 Positionen`

## Output Sections

Die Ausgabeabschnitte `A` bis `G` können einzeln aktiviert/deaktiviert werden.

Wenn Abschnitte weggelassen werden:

- Die verbleibenden Abschnitte werden alphabetisch neu nummeriert.
- Wenn keine Output Sections ausgewählt sind, erscheint ein Popup.

## Prompt Instructions

Folgende Prompt-Instruktionen sind optional:

- Home-Bias-Hinweis
- Währungsabsicherung
- Look-through exposure assessment
- Synthetic ETF assessment

Die Home-Bias-Instruktion wird bei `USD` ausgeblendet.

Die Synthetic-ETF-Instruktion erwähnt strukturelle Vorteile, insbesondere Markteffizienz und reduzierte Quellensteuer-Leakage bei US-Aktienexposure, und verlangt Erklärung in der Zusammenfassung.

## Plausibilitätsprüfungen und Popups

Alle Popups sind Warnungen, keine Blockaden.

### Risk Appetite und Anlagehorizont

- `Very high` + Anlagehorizont unter `>=10 years`: Warnung.
- `High` + Anlagehorizont unter `>=5 years`: Warnung.

### Maximale Aktienquote

Wenn die maximale Aktienquote oberhalb der Auto-Obergrenze des gewählten Risikoappetits liegt, erscheint eine Warnung.

Diese Warnung erscheint nur einmal pro Risikoappetit, bis der Risikoappetit geändert wird.

### Keine Anlageklassen oder keine Ausgabeabschnitte

- Wenn keine Anlageklasse ausgewählt ist: Popup.
- Wenn kein Ausgabeabschnitt ausgewählt ist: Popup.

### Low/Moderate ohne Cash oder Bonds

Wenn `Risk appetite` `Low` oder `Moderate` ist:

- Warnung beim Abwählen von `Cash / Money Market`.
- Warnung beim Abwählen von `Bonds`.
- Wenn Cash oder Bonds wieder hinzugefügt werden, erscheint keine neue Warnung.
- Wenn später auf `Low` oder `Moderate` gewechselt wird und Cash/Bonds bereits fehlen, erscheint ebenfalls eine Warnung.

### Balanced und höher ohne Equities

Wenn `Risk appetite` `Balanced`, `High` oder `Very high` ist:

- Warnung beim Abwählen von `Equities`.
- Wenn `Equities` wieder hinzugefügt wird, erscheint keine neue Warnung.
- Wenn später auf `Balanced`, `High` oder `Very high` gewechselt wird und `Equities` bereits fehlt, erscheint ebenfalls eine Warnung.

### Crypto bei Low/Moderate

Wenn `Crypto Assets` ausgewählt ist und `Risk appetite` `Low` oder `Moderate` ist:

- Warnung, dass Crypto als volatile Satellitenallokation besonders bewusst begründet werden sollte.

### Crypto ohne Rebalancing-Konzept

Wenn `Crypto Assets` ausgewählt ist und Output Section `F) Rebalancing concept` deaktiviert wird:

- Warnung, dass ein Rebalancing-Konzept bei Crypto wegen möglicher Allokationsdrift besonders wichtig ist.

### Bonds abgewählt bei kurzem Anlagehorizont

Wenn `Bonds` abgewählt ist und `Investment horizon` `>=3 years` ist:

- Warnung, dass der Ausschluss von Anleihen bewusst geprüft werden sollte, weil Stabilitätsbausteine bei kürzerem Horizont besonders wichtig sein können.

### Look-through-Sektion ohne Look-through-Instruktion

Wenn Output Section `E) Top 10 look-through holdings` aktiv ist, aber die Look-through-Instruktion deaktiviert wird:

- Warnung, dass die erwartete Ausgabe weniger eindeutig sein kann.

### Synthetic ETF Assessment ohne Equities

Wenn `Synthetic ETF assessment` aktiv ist, aber `Equities` abgewählt wird:

- Warnung, dass diese Anforderung vor allem bei Aktienexposure, insbesondere US-Aktien, relevant ist.

### Listed Real Estate oder Crypto bei sehr wenigen ETFs

Wenn `Listed Real Estate` oder `Crypto Assets` ausgewählt ist und die minimale ETF-Zielanzahl `5` oder tiefer ist:

- Warnung, dass eine separate Immobilien-/REIT-Allokation bei sehr wenigen ETF-Positionen schwer sauber umsetzbar sein kann.
- Warnung, dass eine separate Krypto-Satellitenallokation bei sehr wenigen ETF-Positionen schwer sauber umsetzbar sein kann.

### Mindestanzahl ETFs relativ zu Anlageklassen

Wenn die minimale ETF-Zielanzahl kleiner ist als die Zahl der ausgewählten Anlageklassen:

- Popup mit den ausgewählten Anlageklassen.
- Hinweis, dass die Mindestanzahl ETFs mindestens der Zahl der ausgewählten Anlageklassen entsprechen sollte.
- Bei `CHF` und ausgewählten `Equities` wird `+1` eingerechnet, weil die Schweiz als separate Aktienallokation berücksichtigt wird.
- Beispiel: 5 ausgewählte Anlageklassen inklusive Aktien in `CHF` ergeben eine sinnvolle Mindestanzahl von `6` ETFs.

## Copy und Export

Der generierte Prompt kann:

- in die Zwischenablage kopiert werden,
- als `.txt` exportiert werden,
- als `.md` exportiert werden.

Der Export verwendet denselben Prompt-Text wie der Copy-Button. Die Dateinamen folgen dem Muster:

- `portfolio-prompt-chf-high.txt`
- `portfolio-prompt-chf-high.md`
