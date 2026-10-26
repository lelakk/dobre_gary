#set page(
  paper: "a4",
  header: align(right)[
    #text(size: 4.5pt, fill: luma(100))[#title()]
  ],
  footer: align(center)[
    #text(size: 9pt)[
      #context counter(page).display("1 / 1", both: true)
    ]
  ]
)

#set document(
  title: [Projekt Baz Danych],
  author: ("Gabriela Kłos", "Paweł Lelakowski", "Gabriel Pilch", "Piotr Niepsuj"),
  description: [Opisanie bazy danych sklepu internetowego zajmującego się sprzedażą sprzętu do kuchni],
  keywords: ("mariadb", "database", "baza danych")
)

#set text(lang: "pl")
#set heading(numbering: "1.1.")

#align(center)[
  #text(size: 18pt, weight: "bold")[KUCHENNY SKLEP INTERNETOWY]\
  #v(2mm)
  #text(size: 13pt)[Bazy Danych]\
  #text(size: 11pt, style: "italic")[Projekt]
  #v(2mm)
  #text(size: 11pt)[*Autorzy:* Gabriela Kłos, Paweł Lelakowski, Gabriel Pilch, Piotr Niepsuj]
  #v(4mm)
]

#outline(title: none, indent: auto)

#pagebreak()

= Relacje w bazie danych

W projekcie występują następujące relacje między encjami:

*Relacje 1:N (jeden do wielu):*
- `users` (1) $->$ (N) `addresses` - użytkownik może zapisać wiele adresów w książce adresowej (`ON DELETE CASCADE`).
- `users` (1) $->$ (N) `orders` - użytkownik może złożyć wiele zamówień (`ON DELETE RESTRICT`).
- `addresses` (1) $->$ (N) `orders` (jako `shipping_address_id` oraz `billing_address_id`) - jeden adres może być użyty w wielu zamówieniach (`ON DELETE RESTRICT`). Klucze obce są złożone z `(user_id, address_id)`, więc adres dostawy i rozliczenia musi należeć do kupującego.
- `categories` (1) $->$ (N) `categories` (`parent_id`) - relacja rekurencyjna (drzewo kategorii, np. _Noże i akcesoria do krojenia_ $->$ _Noże szefa kuchni_, `ON DELETE SET NULL`).
- `orders` (1) $->$ (N) `order_items` - jedno zamówienie składa się z wielu pozycji (`ON DELETE CASCADE`).
- `orders` (1) $->$ (N) `payments` - zamówienie może mieć wiele prób płatności (np. pierwsza nieudana, druga opłacona, `ON DELETE RESTRICT`).
- `orders` (1) $->$ (N) `shipments` - zamówienie może zostać wysłane w jednej lub kilku paczkach (`ON DELETE CASCADE`).

*Relacje 1:1 (jeden do jednego):*
- `products` (1) $->$ (1) `inventory` - każdy produkt ma dokładnie jeden rekord stanu magazynowego (`PRIMARY KEY` w `inventory` to `product_id`, `ON DELETE RESTRICT`).

*Relacje N:M (wiele do wielu):*
- `products` (N) $<->$ (M) `categories` poprzez tabelę asocjacyjną `product_categories` (produkt może należeć do kilku kategorii, a kategoria zawiera wiele produktów).

#pagebreak()

= Słownik danych

// Konfiguracja wyglądu tabel
#show table.cell.where(y: 0): set text(weight: "bold", fill: white)
#set table(
  stroke: 0.5pt + luma(200),
  inset: (x: 7pt, y: 5.5pt),
  fill: (x, y) => if y == 0 { rgb("#2b4c7e") } else if calc.even(y) { luma(246) } else { white },
)

// Funkcja pomocnicza generująca sekcję dla pojedynczej tabeli SQL
#let slownik-tabela(nazwa, opis, ..wiersze) = block(breakable: false, width: 100%, below: 1.4em)[
  === Tabela #raw(nazwa)
  #opis
  #text(size: 9pt)[
    #table(
      columns: (1.3fr, 1.2fr, 1.8fr, 2.3fr),
      align: (left + horizon, left + horizon, left + horizon, left + horizon),
      table.header(
        [Kolumna], [Typ danych], [Ograniczenia (Constraints)], [Opis atrybutu]
      ),
      ..wiersze
    )
  ]
]

Szczegółowe zestawienie wszystkich 10 tabel tworzących schemat bazy danych sklepu internetowego z wyposażeniem kuchennym wraz z opisem ich przeznaczenia, typami danych oraz więzami integralności.

#slownik-tabela(
  "users",
  [Przechowuje dane kont zarejestrowanych klientów sklepu (zarówno klientów indywidualnych, jak i przedstawicieli restauracji). Stanowi główną encję uwierzytelniania oraz właściciela zamówień i książki adresowej.],
  [`user_id`], [`BIGINT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny identyfikator klienta],
  [`email`], [`VARCHAR(255)`], [`NOT NULL`, `UNIQUE`, `CHECK` (format e-mail, bez białych znaków)], [Adres e-mail (służy jako login użytkownika)],
  [`password_hash`], [`VARCHAR(255)`], [`NOT NULL`, `CHECK` (długość ≥ 20 znaków)], [Zahaszowane hasło użytkownika (np. algorytm bcrypt)],
  [`first_name`], [`VARCHAR(100)`], [`NOT NULL`, `CHECK` (niepuste)], [Imię klienta],
  [`last_name`], [`VARCHAR(100)`], [`NOT NULL`, `CHECK` (niepuste)], [Nazwisko klienta],
  [`phone`], [`VARCHAR(30)`], [`NULL`, `CHECK` (dozwolone znaki, 7–15 cyfr)], [Numer telefonu kontaktowego dla kuriera],
  [`created_at`], [`TIMESTAMP`], [`NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`], [Data i czas rejestracji konta],
)

#slownik-tabela(
  "addresses",
  [Książka adresowa użytkowników. Przechowuje adresy dostaw (np. dom, lokal gastronomiczny) oraz dane adresowe wykorzystywane do wystawiania faktur (adresy rozliczeniowe).],
  [`address_id`], [`BIGINT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny identyfikator adresu],
  [`user_id`], [`BIGINT UNSIGNED`], [`FK (users.user_id)`, `NOT NULL`], [Użytkownik, do którego należy dany adres],
  [`recipient_name`], [`VARCHAR(150)`], [`NOT NULL`, `CHECK` (niepuste)], [Imię i nazwisko odbiorcy lub nazwa firmy/restauracji],
  [`street_line1`], [`VARCHAR(255)`], [`NOT NULL`, `CHECK` (niepuste)], [Ulica wraz z numerem budynku i lokalu],
  [`street_line2`], [`VARCHAR(255)`], [`NULL`, `CHECK` (NULL lub niepuste)], [Dodatkowe wskazówki adresowe (np. piętro, klatka)],
  [`city`], [`VARCHAR(100)`], [`NOT NULL`, `CHECK` (niepuste)], [Miejscowość],
  [`state_province`], [`VARCHAR(100)`], [`NOT NULL`, `CHECK` (niepuste)], [Województwo lub region administracyjny],
  [`postal_code`], [`VARCHAR(20)`], [`NOT NULL`, `CHECK` (format `NN-NNN`)], [Kod pocztowy],
  [`created_at`], [`TIMESTAMP`], [`NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`], [Data dodania adresu do książki adresowej],
)

#pagebreak()

#slownik-tabela(
  "categories",
  [Słownik kategorii asortymentu kuchennego obsługujący strukturę drzewiastą (hierarchiczną) dzięki relacji zwrotnej `parent_id`. Pozwala dzielić główne działy (np. _Noże kuchenne_) na węższe podkategorie (np. _Noże Santoku_).],
  [`category_id`], [`INT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny identyfikator kategorii],
  [`parent_id`], [`INT UNSIGNED`], [`FK (categories.category_id)`, `NULL`], [Wskazanie na kategorię nadrzędną (`NULL` dla głównych)],
  [`name`], [`VARCHAR(100)`], [`NOT NULL`, `CHECK` (niepuste)], [Nazwa kategorii wyświetlana w menu sklepu],
)

#slownik-tabela(
  "products",
  [Główny katalog produktów oferowanych przez sklep (noże szefa kuchni, zastawa porcelanowa, patelnie żeliwne, garnki i akcesoria). Przechowuje parametry fizyczne towaru oraz jego bieżącą cenę katalogową.],
  [`product_id`], [`BIGINT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny identyfikator artykułu kuchennego],
  [`sku`], [`VARCHAR(64)`], [`NOT NULL`, `UNIQUE`, `CHECK` (litery, cyfry, `_`, `-`)], [Unikalny kod magazynowy produktu (Stock Keeping Unit)],
  [`name`], [`VARCHAR(200)`], [`NOT NULL`, `CHECK` (niepuste)], [Pełna nazwa handlowa produktu],
  [`brand`], [`VARCHAR(100)`], [`NOT NULL`, `CHECK` (niepuste)], [Marka / producent (np. _Zwilling_, _Gerlach_, _Le Creuset_)],
  [`description`], [`TEXT`], [`NULL`, `CHECK` (NULL lub niepuste)], [Szczegółowy opis zastosowania i parametrów technicznych],
  [`base_price`], [`DECIMAL(10,2)`], [`NOT NULL`, `CHECK (base_price > 0)`], [Aktualna cena katalogowa brutto (w PLN)],
  [`created_at`], [`TIMESTAMP`], [`NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`], [Data wprowadzenia produktu do oferty],
)

#slownik-tabela(
  "product_categories",
  [Tabela asocjacyjna (łącząca) realizująca relację wiele-do-wielu (N:M) pomiędzy produktami a kategoriami. Umożliwia przypisanie jednego artykułu kuchennego do kilku kategorii jednocześnie.],
  [`product_id`], [`BIGINT UNSIGNED`], [`PK`, `FK (products.product_id)`, `ON DELETE CASCADE`], [Identyfikator przypisywanego produktu],
  [`category_id`], [`INT UNSIGNED`], [`PK`, `FK (categories.category_id)`, `ON DELETE CASCADE`], [Identyfikator kategorii, do której należy produkt],
)

#pagebreak()

#slownik-tabela(
  "inventory",
  [Przechowuje aktualny stan magazynowy każdego produktu. Każdy produkt ma dokładnie jeden rekord stanu (`PRIMARY KEY` to `product_id`). Zapobiega sprzedaży towaru poniżej zera dzięki ograniczeniu `CHECK (quantity >= 0)`.],
  [`product_id`], [`BIGINT UNSIGNED`], [`PK`, `FK (products.product_id)`, `NOT NULL`, `ON DELETE RESTRICT`], [Identyfikator składowanego produktu],
  [`quantity`], [`INT`], [`NOT NULL`, `DEFAULT 0`, `CHECK (>= 0)`], [Liczba dostępnych sztuk produktu],
  [`updated_at`], [`TIMESTAMP`], [`NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`, `ON UPDATE CURRENT_TIMESTAMP`], [Czas ostatniej zmiany stanu magazynowego],
)

#slownik-tabela(
  "orders",
  [Tabela nagłówków zamówień składanych przez klientów. Łączy kupującego z wybranym adresem dostawy i adresem rozliczeniowym oraz przechowuje aktualny status realizacji i łączną wartość koszyka.],
  [`order_id`], [`BIGINT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny numer zamówienia],
  [`user_id`], [`BIGINT UNSIGNED`], [`FK (users.user_id)`, `NOT NULL`], [Klient składający zamówienie],
  [`shipping_address_id`], [`BIGINT UNSIGNED`], [`FK (user_id, shipping_address_id) → addresses (user_id, address_id)`, `NOT NULL`], [Adres fizycznej dostawy zamówienia (musi należeć do kupującego)],
  [`billing_address_id`], [`BIGINT UNSIGNED`], [`FK (user_id, billing_address_id) → addresses (user_id, address_id)`, `NOT NULL`], [Adres rozliczeniowy (do faktury, musi należeć do kupującego)],
  [`order_status`], [`ENUM(...)`], [`NOT NULL`, `DEFAULT 'pending'`, `CHECK` (dozwolone wartości)], [Status zamówienia (`pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`)],
  [`total_amount`], [`DECIMAL(10,2)`], [`NOT NULL`, `DEFAULT 0.00`, `CHECK (>= 0)`], [Łączna wartość brutto wszystkich pozycji zamówienia],
  [`created_at`], [`TIMESTAMP`], [`NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`], [Data i czas złożenia zamówienia],
)

#pagebreak()

#slownik-tabela(
  "order_items",
  [Szczegółowy wykaz pozycji wchodzących w skład zamówienia. Rejestruje zamawianą ilość oraz historyczną cenę jednostkową obowiązującą w momencie zakupu.],
  [`order_item_id`], [`BIGINT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny identyfikator pozycji zamówienia],
  [`order_id`], [`BIGINT UNSIGNED`], [`FK (orders.order_id)`, `NOT NULL`, `ON DELETE CASCADE`, `UNIQUE (order_id, product_id)`], [Odwołanie do nadrzędnego zamówienia],
  [`product_id`], [`BIGINT UNSIGNED`], [`FK (products.product_id)`, `NOT NULL`, `ON DELETE RESTRICT`], [Zamówiony produkt kuchenny],
  [`quantity`], [`INT UNSIGNED`], [`NOT NULL`, `CHECK (quantity > 0)`], [Liczba zamówionych sztuk danego artykułu],
  [`unit_price`], [`DECIMAL(10,2)`], [`NOT NULL`, `CHECK (unit_price > 0)`], [Cena jednostkowa brutto produktu w chwili zakupu],
)

#slownik-tabela(
  "payments",
  [Rejestr transakcji płatniczych powiązanych z zamówieniami. Pozwala śledzić wybraną metodę płatności, zewnętrzne numery referencyjne bramek płatniczych, nieudane próby oraz zwroty.],
  [`payment_id`], [`BIGINT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny identyfikator operacji płatniczej],
  [`order_id`], [`BIGINT UNSIGNED`], [`FK (orders.order_id)`, `NOT NULL`], [Identyfikator opłacanego zamówienia],
  [`payment_method`], [`ENUM(...)`], [`NOT NULL`, `CHECK` (dozwolone wartości)], [Kanał płatności (`credit_card`, `paypal`, `bank_transfer`, `stripe`, `blik`)],
  [`transaction_reference`], [`VARCHAR(255)`], [`NOT NULL`, `UNIQUE`, `CHECK` (niepuste)], [Unikalny identyfikator transakcji z zewnętrznego systemu płatności],
  [`amount`], [`DECIMAL(10,2)`], [`NOT NULL`, `CHECK (amount > 0)`], [Kwota płatności w PLN],
  [`payment_status`], [`ENUM(...)`], [`NOT NULL`, `DEFAULT 'initiated'`, `CHECK` (dozwolone wartości)], [Status transakcji (`initiated`, `completed`, `failed`, `refunded`)],
  [`paid_at`], [`TIMESTAMP`], [`NULL`, `CHECK` (spójność ze statusem)], [Data i czas potwierdzenia wpłaty (`NOT NULL` dla `completed`/`refunded`, `NULL` dla `initiated`/`failed`)],
)

#pagebreak()

#slownik-tabela(
  "shipments",
  [Ewidencja przesyłek kurierskich i paczkomatowych realizujących dostawę zamówienia. Jedno zamówienie może być podzielone na wiele przesyłek (np. przy wysyłce w osobnych paczkach).],
  [`shipment_id`], [`BIGINT UNSIGNED`], [`PK`, `AUTO_INCREMENT`, `NOT NULL`], [Unikalny identyfikator przesyłki],
  [`order_id`], [`BIGINT UNSIGNED`], [`FK (orders.order_id)`, `NOT NULL`], [Identyfikator wysyłanego zamówienia],
  [`carrier`], [`VARCHAR(100)`], [`NOT NULL`, `CHECK` (niepuste)], [Nazwa przewoźnika (np. _InPost Paczkomaty_, _DPD Polska_, _DHL_)],
  [`tracking_number`], [`VARCHAR(150)`], [`NULL`, `UNIQUE`, `CHECK` (NULL lub niepuste)], [Unikalny numer listu przewozowego do śledzenia paczki],
  [`shipment_status`], [`ENUM(...)`], [`NOT NULL`, `DEFAULT 'label_created'`, `CHECK` (dozwolone wartości)], [Status logistyczny (`label_created`, `in_transit`, `out_for_delivery`, `delivered`)],
  [`shipped_at`], [`TIMESTAMP`], [`NULL`, `CHECK` (spójność ze statusem)], [Data i czas przekazania paczki kurierowi],
  [`delivered_at`], [`TIMESTAMP`], [`NULL`, `CHECK` (spójność ze statusem i `shipped_at`)], [Data i czas doręczenia przesyłki odbiorcy],
)

=== Widok #raw("v_product_stock_summary")

Widok raportowy łączący produkty z ich aktualnym stanem magazynowym. Dzięki zastosowaniu `LEFT JOIN` produkty bez rekordu w tabeli `inventory` również pojawiają się w wyniku (z `total_stock` równym 0).

#text(size: 9pt)[
  #table(
    columns: (1.4fr, 1.4fr, 2.6fr),
    align: (left + horizon, left + horizon, left + horizon),
    table.header([Kolumna], [Typ danych], [Opis]),
    [`product_id`], [`BIGINT UNSIGNED`], [Identyfikator produktu],
    [`sku`], [`VARCHAR(64)`], [Kod magazynowy produktu],
    [`product_name`], [`VARCHAR(200)`], [Nazwa produktu],
    [`brand`], [`VARCHAR(100)`], [Marka / producent],
    [`base_price`], [`DECIMAL(10,2)`], [Cena katalogowa produktu],
    [`total_stock`], [`INT`], [Łączny stan magazynowy (`0`, jeśli brak rekordu w `inventory`)],
    [`total_price`], [`DECIMAL(10,2)`], [Wartość stanu magazynowego (`base_price * total_stock`)],
  )
]

#pagebreak()

= Uzasadnienie normalizacji

Zaprojektowany schemat bazy danych spełnia wymogi co najmniej *trzeciej postaci normalnej (3NF)*:

+ *Pierwsza Postać Normalna (1NF):*
  - Wszystkie atrybuty w tabelach są *atomowe* (niepodzielne) - np. dane osobowe zostały rozbite na `first_name` i `last_name`, a dane adresowe na `street_line1`, `street_line2`, `city`, `state_province` oraz `postal_code`.
  - Brak powtarzających się grup kolumn (np. zamiast kolumn `category_1`, `category_2` w tabeli `products`, wydzielono tabelę łączącą `product_categories`).
  - Każda tabela posiada zdefiniowany klucz główny (`PRIMARY KEY`).

+ *Druga Postać Normalna (2NF):*
  - Spełnione są warunki 1NF, a każdy atrybut niebędący częścią klucza zależy *w pełni funkcjonalnie* od całego klucza głównego.
  - W tabeli `product_categories` ze złożonym kluczem głównym `(product_id, category_id)` nie występują atrybuty niekluczowe, więc nie ma możliwości częściowej zależności. W pozostałych tabelach klucz główny jest pojedynczą kolumną, a wszystkie atrybuty niekluczowe zależą od niego w całości.

+ *Trzecia Postać Normalna (3NF):*
  - Spełnione są warunki 2NF oraz *nie występują zależności przechodnie* (atrybuty niekluczowe zależą wyłącznie od klucza głównego, a nie od innych atrybutów niekluczowych).
  - Adresy dostawy i adresy rozliczeniowe zostały wydzielone do osobnej tabeli `addresses`, dzięki czemu zmiana adresu użytkownika lub przypisanie go do zamówienia nie powoduje duplikowania danych adresowych w tabeli `orders`.
  - *Uwaga projektowa dotycząca cen historycznych:* Kolumna `unit_price` w tabeli `order_items` przechowuje cenę produktu *w momencie zakupu* (np. z uwzględnieniem ówczesnego cennika lub promocji), natomiast `base_price` w tabeli `products` to bieżąca cena katalogowa. Dzięki temu późniejsza zmiana ceny noża czy garnka w katalogu nie fałszuje historycznych faktur i zamówień.
