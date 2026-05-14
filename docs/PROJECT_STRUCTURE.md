# 1. Core Game Flow

## 1.1 Room Logic

All components inside (components)/game/room-modal path for room logic.

### 1.1.1 Create A Room (Host Flow)

- Entry Point: Kullanici MainMenuScreen (MainMenuScreen.tsx) uzerinden Create New Room (MainMenuActionButton.tsx) butonuna basar ve CreateNewRoom modali (CreateNewRoomModal.tsx) acilir.
- Oda olusturma 3 adimda ilerler:

1. Avatar Secimi (AvatarStep.tsx) -Common for CreateNewRoomModal.tsx and JoinExistingRoomModal.tsx-
2. Isim Girisi (NameStep.tsx) -Common for CreateNewRoomModal.tsx and JoinExistingRoomModal.tsx-
3. Kategori Secimi (UI: ChooseCategoryStep.tsx | Data: categoryService.ts | Read path: 1- in-memory cache, 2- AsyncStorage (env-scoped, TTL-validated), 3- Supabase fetch on cache miss)

Her adim, bir sonraki adima gecmeden dogrulanir. Final create aksiyonu icin selectedAvatar + userName + selectedCategory zorunludur.

Secilen category eger coin gerektiren bir kategori ise ve kullanicinin coin'i yetersizse create request'i gonderilmez; onBuyCoins akisi tetiklenir. Peki Kullanicinin coini yeterli mi diye nasil kontrol edilir? CoinContext.tsx icindeki useCoins() hook'u cagrilir. Bu hook’tan gelen coins degeri, CreateNewRoomModal icindeki handleCreate fonksiyonunda secilen kategorinin coinsRequired (dynamically fetched from supabase -it's cached for 1 hour tho-) degeriyle karsilastirilir (coins < category.coinsRequired).
Eger yetersizse: onBuyCoins?.() cagrilir ve return ile oda olusturma kesilir.

-- Not: burada create aninda ekstra Supabase coin sorgusu atilmaz; mevcut context coins degeri kullanilir. (Coin'i kesinlikle harcayacagimizdan emin oldugumuz yerlerde -ornegin oyunu baslatirken- kesin 1 tur database'e gidilir. -Context'teki veri stale kalmis olabilir diye-) --

Eger coin yeterliyse: CreateNewRoomModal.tsx icinden onCreateRoom(userName.trim(), selectedCategory, selectedAvatar) prop fonksiyonu cagrilir.

Bu, MainMenuScreen.tsx icindeki handleCreateRoom fonksiyonunu calistirir.

handleCreateRoom fonksiyonu, socketService.createRoom(userName, avatar, category) ile backend'e emit eder.

Başarılı olursa backend room-created döner, Promise resolve olur.
Hata olursa room-error ile reject olur.
Başarıda MainMenuScreen router.push("/GameRoom", roomCode) ile game room’a geçer.

---

---

---

---

---

## AI Analiz Akisi

- Oyun bitis ekraninda (Farkli **Ana Kategoriler** -Check 2.2 to see what 'ana category is'- icin farkli bitis ekranlari) oyuncu 'AI Analysis' (AiAnalysisEntryButton.tsx) butonuna basar. Buton icerigi farkli **ana kategorilere** gore degiskenlik gosterir.
  Oyun başlatma
  Round döngüsü
  Oyun bitiş
  Coin harcama noktaları

# Game Modes / Categories

Oyunda hangi kategori/modlar var (know_me_well, vs)
Her birinin farkı ne? (soru üretimi, scoring, sonuç ekranı, AI tipi)

# State Ownership

Kritik state nerede tutuluyor? (GameRoom vs component local state)
Hangi state global (context), hangisi screen-level

# Contracts

Backend’den beklenen ana payloadlar
completedRounds, AiAnalysisType, yüzde hesaplama mantığı gibi sözleşmeler

# Non-obvious rules

“Bu kural önemli, değiştirirken dikkat et” listesi
(örn: know_me_well round index parity mantığı)
