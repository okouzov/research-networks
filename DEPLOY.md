# Публикуване на сайта в Hostinger и обновяване

Сайтът е изцяло статичен (HTML + CSS + JS + JSON). Няма база данни, PHP или build стъпка. Затова е достатъчно файловете да се копират в папката на сайта в Hostinger. Работи и в главната папка на домейна (`public_html`), и в подпапка или поддомейн, защото всички пътища са относителни.

Има два начина. За честите промени **вариант Б е най-удобният**. Той се настройва веднъж, а след това всяка промяна е „Commit + Push“ в GitHub Desktop.

---

## Вариант А — ръчно качване на ZIP (без допълнителни настройки)

### Първо качване
1. В папката на проекта изпълнете:
   ```powershell
   python tools/pack.py
   ```
   Командата създава `deploy\site.zip` само с нужните файлове (~150 KB). Без `tools`, `export` и `README`.
2. Влезте в **hPanel → Websites → (вашият сайт) → File Manager**.
3. Отворете `public_html`, или подпапката или поддомейна, където ще стои сайтът.
   - Ако там има стандартен файл на Hostinger (`default.php` / `index.php`), изтрийте го. Иначе той ще се отваря вместо сайта.
4. **Upload** → изберете `site.zip`. След това десен бутон върху него → **Extract** → в същата папка.
5. Изтрийте `site.zip` от сървъра.
6. Отворете адреса на сайта. Трябва да се отвори NRN BG.

### Обновяване
Повторете стъпки 1, 4 и 5. При Extract потвърдете **презаписване** на съществуващите файлове.

> Ако само сте поправили текст или данни, може да качите и единичен файл, например `data/bulgaria.json` или `bulgaria.html`. Направете го с Upload в съответната папка, с презаписване.

---

## Вариант Б — GitHub + автоматично публикуване (препоръчвам)

Схемата е: промяна на компютъра → **Commit + Push в GitHub Desktop** → Hostinger сам изтегля новата версия за секунди.

> Git функцията е в hPanel → **Advanced → GIT**. Има я в плановете Premium/Business/Cloud. Ако университетският акаунт я няма, използвайте вариант А.

### Еднократна настройка
1. **Хранилище в GitHub** (през GitHub Desktop, акаунт okouzov):
   - *File → Add local repository* → изберете папката `research-networks`. Ще предложи *create a repository* → **Create repository**.
   - **Publish repository**. Най-просто е **без** отметка „Keep this code private“. Сайтът и без това ще е публичен.
   - `.gitignore` вече изключва `export/` и `deploy/`.
2. **Свързване в Hostinger:** hPanel → (сайтът) → **Advanced → GIT** → *Create a New Repository*:
   - Repository: `https://github.com/okouzov/research-networks.git`
   - Branch: `main`
   - Directory: празно за `public_html`, или името на подпапката.
   - ⚠ Папката трябва да е **празна** при първото свързване. Ако има файлове, преместете ги временно или ги изтрийте от File Manager.
   - **Create** → след това **Deploy**.
3. **Автоматично публикуване:** в същия екран → **Auto Deployment** → копирайте Webhook URL.
   - В GitHub: хранилището → **Settings → Webhooks → Add webhook**.
   - Payload URL: поставете адреса. Content type: `application/json`. Събитие: *Just the push event*. Натиснете **Add webhook**.
4. *(Само ако хранилището е private.)* В hPanel → GIT копирайте показания SSH ключ. В GitHub → Settings → **Deploy keys → Add deploy key** поставете ключа. В Hostinger ползвайте SSH адреса `git@github.com:okouzov/research-networks.git`.

### Обновяване (всеки път)
1. Направете промяната (сами или с Claude) и я проверете локално на http://localhost:8519.
2. **GitHub Desktop** → кратко описание долу вляво → **Commit to main** → **Push origin**.
3. След 10–30 секунди презаредете сайта. Ако не се е обновил: hPanel → GIT → **Deploy** ръчно.

---

## Полезно

- **Списъкът eduroam в България** е снимка към дата. Преди публикуване може да го освежите така:
  ```powershell
  python tools/update_eduroam.py
  ```
  Членовете на eduGAIN (BIF) се обновяват сами, на живо от API-то на eduGAIN.
- **`.htaccess`** (идва със сайта):
  - пренасочва към HTTPS;
  - кара браузърите да проверяват за нова версия на страниците, стиловете и данните, така че промените се виждат веднага, без Ctrl+F5;
  - крие помощните файлове (`.py`, `.md`).
  - Ако сайтът изобщо не се отваря, защото SSL сертификатът още не е активен, изтрийте трите реда под `# always HTTPS` в `.htaccess`. Или активирайте SSL от hPanel → **Security → SSL**.
- **Отваря се страницата на Hostinger вместо сайта:** в папката е останал `default.php` или `index.php`. Изтрийте го.
- **Начална страница:** `index.html` пренасочва към `bulgaria.html`. Общият преглед е в `home.html`.
