# Portfolio Prompt Builder: Strategie- und Parameterlogik

Diese Datei dokumentiert die fachliche Logik der App in Bezug auf gewählte Strategien, Parameter, automatische Anpassungen und Plausibilitätsprüfungen.

## Markierung konfigurierbarer Werte

Abschnitte oder Werte mit `[config]` werden ganz oder teilweise aus `config.js` gelesen und können dort angepasst werden, ohne die Kernlogik in `app.js` zu ändern.
Abschnitte ohne diese Markierung beschreiben feste App-Logik oder UI-Verhalten.

## Default-Zustand [config + App-Defaults]

Der Initialzustand wird aus `defaultBaseCurrency`, `defaultPresetId`, dem referenzierten Preset, `defaultExchangeByCurrency` und `etfCountBase` in `config.js` abgeleitet. Die übrigen Punkte sind App-Defaults.

- `Base currency`: `CHF`
- `Risk appetite`: `High`
- `Investment horizon`: `>=10 years`
- `Equity allocation range`: `60% bis 80%`
- `Preferred exchange`: `SIX Swiss Exchange`
- `Target ETF positions`: `7 bis 11`
- `Language`: `English`
- Alle Anlageklassen ausser `Listed Real Estate` sind standardmässig ausgewählt, entsprechend dem `Growth`-Preset.
- Alle Ausgabeabschnitte `A` bis `H` sind standardmässig ausgewählt.
- Prompt-Instruktionen für Home Bias, Hedging, Look-through und synthetische ETFs sind standardmässig aktiv.
- Der Ausführungsmodus ist in Pro standardmässig `Strikt`; in Basic wird immer `Schnell` verwendet.

Der Reset-Button ist entsprechend beschriftet als `Reset defaults: Growth CHF` bzw. `Zurücksetzen: Wachstum CHF`.

## Investment Strategy Presets [config]

Die Presets setzen Risikoappetit, Anlagehorizont, Aktienbandbreite und Anlageklassen; die ETF-Zielanzahl wird danach strikt im Auto-Modus aus dem konfigurierten Basiswert abgeleitet.
Diese Werte werden in `config.js` gepflegt, damit sie ohne Eingriff in die App-Logik angepasst werden können.

| Preset | Risikoappetit | Anlagehorizont | Aktienbandbreite | Besondere Logik |
| --- | --- | --- | --- | --- |
| Conservative / Konservativ | `Low` | `>=3 years` | `20% bis 40%` | `Cash`, `Bonds`, `Equities` und `Commodities` werden aktiviert; `Listed Real Estate` und `Crypto Assets` werden abgewählt; ETF-Zielanzahl wird aus `etfCountBase` als `6 bis 10` abgeleitet; ETF-Status bleibt `Auto`. |
| Balanced / Ausgewogen | `Moderate` | `>=5 years` | `40% bis 60%` | `Crypto Assets` und `Listed Real Estate` werden abgewählt; ETF-Zielanzahl wird aus `etfCountBase` als `6 bis 10` abgeleitet; ETF-Status bleibt `Auto`. |
| Growth / Wachstum | `High` | `>=10 years` | `60% bis 80%` | `Listed Real Estate` wird abgewählt, `Crypto Assets` bleibt aktiviert; ETF-Zielanzahl wird aus `etfCountBase` als `7 bis 11` abgeleitet; ETF-Status bleibt `Auto`. |
| Aggressive / Aggressiv | `Very high` | `>=10 years` | `80% bis 100%` | `Bonds` werden abgewählt, `Listed Real Estate` und `Crypto Assets` bleiben aktiviert; ETF-Zielanzahl wird aus `etfCountBase` als `7 bis 11` abgeleitet; ETF-Status bleibt `Auto`. |

Die Preset-Beschreibung zeigt die Aktienbandbreite explizit als `XX-XX% equity` bzw. `XX-XX% Aktien`.

## Konfiguration in `config.js` [config]

`config.js` enthält die fachlich editierbaren Werte:

- `presets`: Strategieprofile inklusive Risikoappetit, Anlagehorizont, Aktienbandbreite und Anlageklassen.
- `etfCountBase`: ETF-Zielanzahl, wenn alle Anlageklassen ausgewählt sind; aktuell `8 bis 12`.
- `label` und `deLabel`: sichtbare Strategienamen; `id` kann ebenfalls angepasst werden, wenn `defaultPresetId` und Referenzen auf die neue ID zeigen.
- `icon`: Icon-Stil des Presets (`conservative`, `balanced`, `growth`, `aggressive`).
- `exchanges`: die im Feld `Preferred exchange` auswählbaren Börsenplätze. Einträge können Strings oder Config-Objekte mit `value`, `label`, `promptLabel` und optional `dePromptLabel` sein; dadurch bleibt die flexible Option `Any European/UK/Swiss exchange` unabhängig vom sichtbaren Label steuerbar.
- Lange Exchange-Labels werden im Selector gekürzt, bleiben aber als vollständiger Title verfügbar; `promptLabel` und `dePromptLabel` steuern den generierten Prompt-Text.
- `defaultBaseCurrency`: Basiswährung für Initialzustand und Reset.
- `defaultExchangeByCurrency`: Default-Börsenplatz pro Basiswährung.
- `defaultPresetId`: Preset für Initialzustand und Reset.

Wenn die App auf WordPress/Plesk veröffentlicht wird, muss `config.js` zusammen mit `index.html`, `styles.css` und `app.js` hochgeladen werden.

## Risk Appetite und Aktienbandbreite

Wenn `Equities` ausgewählt ist, wird die Aktienbandbreite automatisch nach Risikoappetit gesetzt:

Diese Auto-Tabelle ist feste App-Logik. Die in den Presets gesetzten Startwerte für Risikoappetit und Aktienbandbreite sind dagegen `[config]`.

| Risikoappetit | Aktienbandbreite |
| --- | --- |
| `Low` | `20% bis 40%` |
| `Moderate` | `40% bis 60%` |
| `High` | `60% bis 80%` |
| `Very high` | `80% bis 100%` |

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

## ETF-Zielanzahl [config + Auto-Logik]

Basiswert für die Auto-Berechnung in `config.js`:

- `etfCountBase.min`: `8`
- `etfCountBase.max`: `12`

Da der Default-Zustand dem `Growth`-Preset entspricht und `Listed Real Estate` abgewählt ist, startet die App effektiv mit:

- `7 bis 11` ETF-Positionen.

Solange der Nutzer die ETF-Zielanzahl nicht manuell geändert hat:

- Jede abgewählte Nicht-Aktien-Anlageklasse reduziert Minimum und Maximum um `1`.
- Wenn `Equities` abgewählt wird, reduziert dies Minimum und Maximum um `5`.
- Die minimale ETF-Anzahl wird nie unter die Zahl der ausgewählten Anlageklassen gesetzt; bei `CHF` und ausgewählten Aktien wird eine zusätzliche Schweiz-Position als Mindestwert eingerechnet.
- Das Maximum wird nie kleiner als das Minimum.

Wenn der Nutzer die ETF-Zielanzahl über Plus-/Minus-Buttons manuell ändert:

- Der Status wechselt auf `Manual`.
- Weitere Anlageklassenänderungen passen die ETF-Zielanzahl nicht automatisch an.
- Ein Klick auf `Manual` stellt zurück auf Auto und berechnet die ETF-Zielanzahl anhand der aktuell ausgewählten Anlageklassen neu.

Beim `Conservative`-Preset:

- `Listed Real Estate` und `Crypto Assets` werden abgewählt.
- `Cash`, `Bonds`, `Equities` und `Commodities` werden aktiviert.
- Die ETF-Zielanzahl wird aus `etfCountBase` automatisch als `6 bis 10` abgeleitet.
- Der ETF-Status bleibt `Auto`.

Wenn danach `Balanced`, `Growth` oder `Aggressive` gewählt wird:

- `Balanced` aktiviert `Bonds` und `Equities`, lässt aber `Listed Real Estate` und `Crypto Assets` abgewählt.
- `Growth` aktiviert `Bonds`, `Equities` und `Crypto Assets`, lässt aber `Listed Real Estate` abgewählt.
- `Aggressive` aktiviert `Equities`, `Listed Real Estate` und `Crypto Assets`, lässt aber `Bonds` abgewählt.
- `Balanced` leitet aus dem Basiswert die ETF-Zielanzahl `6 bis 10` ab.
- `Growth` leitet aus dem Basiswert die ETF-Zielanzahl `7 bis 11` ab.
- `Aggressive` leitet aus dem Basiswert die ETF-Zielanzahl `7 bis 11` ab.
- Der ETF-Status bleibt jeweils `Auto`.

## Base Currency und Preferred Exchange [config + Auto-Logik]

Die Börse wird im Auto-Modus aus der Basiswährung abgeleitet:

| Basiswährung | Auto-Börse |
| --- | --- |
| `CHF` | `SIX Swiss Exchange` |
| `EUR` | `XETRA Deutsche Börse` |
| `USD` | `Any European/UK/Swiss exchange` |
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

## Sprache und Range-Anzeige [App-Logik]

Die UI- und Prompt-Sprache kann zwischen `English` und `German` gewählt werden.

Für Range-Anzeigen gilt:

- Englisch: `40% to 60%`, `8 to 12`
- Deutsch: `40% bis 60%`, `8 bis 12`

Wenn Minimum und Maximum identisch sind:

- Englisch: `Equity allocation: 75%` bzw. `Target exactly 8 positions`
- Deutsch: `Aktienquote: 75%` bzw. `Ziel: genau 8 Positionen`

## Output Sections

Die Ausgabeabschnitte `A` bis `H` können einzeln aktiviert/deaktiviert werden.

Wenn Abschnitte weggelassen werden:

- Die verbleibenden Abschnitte werden alphabetisch neu nummeriert.
- Wenn keine Output Sections ausgewählt sind, erscheint ein Popup.

## Prompt Instructions [App-Logik]

Folgende Prompt-Instruktionen sind optional:

- Home-Bias-Hinweis
- Währungsabsicherung
- Look-through exposure assessment
- Synthetic ETF assessment

Der Ausführungsmodus steuert die Begründungstiefe und die Portfolio-Konstruktionslogik im generierten Prompt:

- `Schnell`: fokussiert auf Geschwindigkeit, Klarheit und pragmatische Portfolio-Konstruktion. Der Prompt verwendet den kurzen Portfolio-Konstruktionsansatz, die kurze Diversifikationsanforderung und die kurze Portfolio-Konstruktionslogik als Ausgabeabschnitt.
- `Strikt`: verlangt strukturierte Begründungsdisziplin, Entscheidungsschritte in Reihenfolge und interne Validierung vor der finalen Antwort. Der Prompt verwendet die ausführliche Efficient-Frontier-Methodik, die Pro-Anforderung zur Risikobeitragsanalyse und die Efficient-Frontier-Perspektive im Ausgabeabschnitt.

In Basic Mode ist der Prompt-Instruktionsbereich geschlossen und der Ausführungsmodus wird immer als `Schnell` in den Prompt geschrieben.
In Pro Mode ist der Ausführungsmodus im Prompt-Instruktionsbereich zwischen `Schnell` und `Strikt` umschaltbar; Default ist `Strikt`.

Die Home-Bias-Instruktion wird bei `USD` ausgeblendet.

Die Synthetic-ETF-Instruktion erwähnt strukturelle Vorteile, insbesondere Markteffizienz und reduzierte Quellensteuer-Leakage bei US-Aktienexposure, und verlangt Erklärung in der Zusammenfassung.

Die generierten Requirements enthalten zusätzlich sprachunabhängig:

- Restriktionen dürfen nicht übersteuert werden; nicht erfüllbare Restriktionen müssen erklärt und mit der nächstbesten praktikablen Alternative beantwortet werden.
- ETF-Auswahl priorisiert liquide, kostengünstige und breit diversifizierte ETFs. UCITS-konforme ETFs werden bevorzugt, sofern sie verfügbar und mit dem gewählten Börsenplatz vereinbar sind.
- Die ETF-Zielanzahl wird als praktikable Zielbandbreite formuliert, ohne Diversifikation oder Umsetzungsrobustheit zu opfern.
- Taktische Marktprognosen, Market-Timing und kurzfristige Renditeprognosen werden ausgeschlossen.
- Annahmen sollen sinnvoll, explizit und minimal sein.
- Output Section B verlangt nach Tabelle 2 einen Hinweis zur regulatorischen und steuerlichen Eignung, der klarstellt, dass ETF-Auswahlen vorläufige Umsetzungsbeispiele sind und die finale Produkteignung vor Ausführung geprüft werden muss.
- Output Section C verlangt 6-10 knappe Bullet Points.
- Output Section E verlangt die aktuell verfügbaren ETF-Holdings oder Index-Factsheets für die Look-through-Analyse und eine Erklärung, falls die aktuelle Marktkapitalisierungs-Rangfolge von der gezeigten Rangfolge abweicht.
- Output Section H soll knapp bleiben, sich auf die tatsächliche Allokation beziehen und keine generische Efficient-Frontier-Theorie liefern.

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

### Low ohne Cash oder Bonds

Wenn `Risk appetite` `Low` ist:

- Warnung beim Abwählen von `Cash / Money Market`.
- Warnung beim Abwählen von `Bonds`.
- Wenn Cash oder Bonds wieder hinzugefügt werden, erscheint keine neue Warnung.
- Wenn später auf `Low` gewechselt wird und Cash/Bonds bereits fehlen, erscheint ebenfalls eine Warnung.

### Moderate und höher ohne Equities

Wenn `Risk appetite` `Moderate`, `High` oder `Very high` ist:

- Warnung beim Abwählen von `Equities`.
- Wenn `Equities` wieder hinzugefügt wird, erscheint keine neue Warnung.
- Wenn später auf `Moderate`, `High` oder `Very high` gewechselt wird und `Equities` bereits fehlt, erscheint ebenfalls eine Warnung.

### Crypto bei Low

Wenn `Crypto Assets` ausgewählt ist und `Risk appetite` `Low` ist:

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
