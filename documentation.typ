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

