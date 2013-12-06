Informationen zur Vorgabe:

Client:
core.js enthaelt util functionen z.B. string.format()
init.js enthaelt init functionen z.B. cross site scrippting aktivieren und ajax cache abschalten (fuer IE notwendig) 
dataservice.js sollte alle Kommunikation zum Server kappseln
ui.js sollte die User Interface logik beinhalten


Server: 
- Debugger des Server: Anleitung hier: https://github.com/node-inspector/node-inspector
- Es gibt einen default User: a mit Password: a
- Es gibt einen default Eintrag mit einem Kommentar.
- Es gibt die folgenden Rest Methoden
GET / => Gibt alle Entries zurück
GET /login => Username falls eingelogt 
POST /login => Sich einlogen
POST /register => sich neu regestieren
GET /users => gibt alle regestrierten Users auf dem Server zurueck
GET /entries => gibt alle Entries zurueck
POST /entry => neuen Eintrag erstellen
POST /entry/:id/up & down => up or down-rating von einem Link
POST /entry/:id/comment => erzeugt einen neuen Kommentar fuer den Link
POST /comment/:id/up b& down => up or down-rating von einem comment
POST /logout => loggt den User aus. 

- Bei andern Requests wird versucht ein File im  Ordner /Public zu finden