# Lokalizasyon (i18n) Kullanım Kılavuzu

Bu proje 3 dil desteği sunmaktadır: İngilizce (en), Türkçe (tr) ve İspanyolca (es).

## Kullanım

### 1. useTranslation Hook'unu Import Edin

```typescript
import { useTranslation } from "../hooks/useTranslation";
```

### 2. Hook'u Kullanın

```typescript
const { t } = useTranslation();

// Basit kullanım
<Text>{t("startScreen.createNewRoom")}</Text>

// Parametreli kullanım (eğer translation'da {{paramName}} formatı varsa)
<Text>{t("welcome.message", { name: "John" })}</Text>
```

## Translation Dosyaları

Translation dosyaları `app/locales/` klasöründe bulunur:

- `en.json` - İngilizce çeviriler
- `tr.json` - Türkçe çeviriler
- `es.json` - İspanyolca çeviriler

## Translation Key Yapısı

Translation key'leri dot notation kullanır:

- `common.ok` → "OK" / "Tamam" / "OK"
- `startScreen.createNewRoom` → "Create New Room" / "Yeni Oda Oluştur" / "Crear Nueva Sala"
- `errors.roomNotFound` → "Room Not Found" / "Oda Bulunamadı" / "Sala No Encontrada"

## Yeni Translation Ekleme

1. İlgili JSON dosyasına yeni key-value çifti ekleyin
2. Tüm 3 dil dosyasına aynı key'i ekleyin
3. Component'te `t("your.new.key")` şeklinde kullanın

## Örnek

```json
// en.json
{
  "mySection": {
    "myKey": "Hello World"
  }
}

// tr.json
{
  "mySection": {
    "myKey": "Merhaba Dünya"
  }
}

// es.json
{
  "mySection": {
    "myKey": "Hola Mundo"
  }
}
```

```typescript
// Component'te kullanım
const { t } = useTranslation();
<Text>{t("mySection.myKey")}</Text>;
```
