Aplikacja TODO v1.0.0 2022-07-15

Alikacja Todo służy do rejestrowania zadań. Zadanie może zarejestować tylko zalogowany użytkownik.
Hasła użytkowników są hashowane przy pomocy modułu bcrypt. Sesje użytków są tworzone za pomocą modułu cookie-session.
Konfiguracja jest trzymana w pliku config.ts, który należy utowrzyć na podstawie config.example.ts.

Skrypt do utowrzenia bazy danych jest zapisany w katalogu utils\scripts\megak_todo.sql

Endpointy

	Owner:
		POST 	/api/v1/owners/register
				Tworzy użytkownika w bazie w tabeli owners. Parametr name musi być unikalny. Wymagane parametry:
				{
					"name": "tester01",
					"fullName": "Adam Nowak",
					"password1":"12345",
					"password2":"12345"
				}
				Po utworzeniu rekordu użytkownik jest zalogowany. Tworzy się ciastko.

		POST 	/api/v1/owners/login
				Logowanie użytkownika który ma już konto. Wymagane prametry:		
				{
					"name": "tester01",
					"password":"12345",
				}
				
		GET 	/api/v1/owners/logout
				Wylogowanie użyta. Czyści ciastko aktualnie zalogowanego użytkownika.

		GET 	/api/v1/owners/
				Pobiera dane aktualnie zalogowanego użytkownika. Zwraca name i fullName. 
				{
					"name": "tester01",
					"fullName": "Adam Nowak",
				}
			
		DELETE 	/api/v1/owners/
				Usuwa konto aktualnie zalogowanego użytkownika oraz wszystkie jego zadania.
	
	
	Task


GET 	/api/v1/task/:id
		Pobiera szczegóły zadania o podanym id. Zwraca poniższe dane.
		{
			"id": "245e0e4f-0aa4-4bee-8f6e-2e31a3d5f267",
			"title": "Zrobić zakupy",
			"description": "marchewka, sałata, tuńczyk",
			"isClosed": 0
		}

GET 	/api/v1/task??pageNumber=1&pageSize=20&isClosed=0&searchText=mojd
		Pobiera listę zadań. Parametry pageNumber i pageSize są wymagana. Parametry isClosed (czy zadanie zamknięte lub otwarte)
		i searchText (szuka tylo po tytule) są opcjonalne. Zwraca poniższe dane.
		
		{
			"pagesCount": 1,
			"pageNumber": 1,
			"pageSize": 20,
			"tasks": [
				{
					"id": "245e0e4f-0aa4-4bee-8f6e-2e31a3d5f267",
					"title": "zadanie pierwsze",
					"description": "opis zadania drugiego",
					"isClosed": 0
				},
				{
					"id": "2ab0a2c4-25f5-4214-8598-a2f5d2b79496",
					"title": "zadanie drugie",
					"description": "opis zadania drugiego",
					"isClosed": 0
				}
			]
		}		


POST 	/api/v1/task/
		Tworzy nowe zadanie. Wymagane poniższe parametry.
		
		{
			"title":"zadanie trzecie",
			"description":"opis zadania trzeciego",
			"isClosed":0
		}
		
PUT 	/api/v1/task/
		Aktualizuje dane zadania. Wymagane poniższe parametry.
		
		{
			"id": "2216978c-3a49-4549-98c2-8a7ea10b4a412",
			"title": "po zmianie moj tytul 444",
			"description": "po zmianie opid zadania 55",
			"isClosed": 1
		}
		
PATCH 	/api/v1/task/close/:id
		Zamyka zadanie o podanym id w parametrze.
		
		
DELETE	/api/v1/task/:id
		Usuwa zadanie o podanym id w parametrze.



