# 📚 CÓDIGO COMPLETO - DM MOTORS APP

## 📁 Estrutura do Projeto

```
/app
├── backend/
│   ├── server.py          # Backend FastAPI completo
│   ├── .env               # Variáveis de ambiente
│   └── requirements.txt   # Dependências Python
│
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx              # Layout raiz
│   │   ├── index.tsx                # Tela inicial (home)
│   │   ├── submission-form.tsx      # Formulário consignar/vender
│   │   ├── admin-login.tsx          # Login administrativo
│   │   └── (tabs)/
│   │       ├── _layout.tsx          # Layout das tabs
│   │       ├── vehicles.tsx         # Lista de veículos
│   │       └── admin.tsx            # Painel administrativo
│   ├── app.json           # Configuração do Expo
│   ├── package.json       # Dependências Node
│   └── .env              # Variáveis de ambiente frontend
```

---

## 🔧 BACKEND

### Arquivo: `/app/backend/server.py`

**Principais funcionalidades:**
- ✅ Autenticação JWT com bcrypt
- ✅ CRUD completo para veículos
- ✅ CRUD completo para solicitações (consignar/vender)
- ✅ Proteção de rotas com Bearer token
- ✅ MongoDB com Motor (async)

**Endpoints disponíveis:**

**Públicos:**
- `GET /api/` - Health check
- `POST /api/auth/login` - Login admin
- `GET /api/vehicles` - Listar veículos disponíveis
- `GET /api/vehicles/{id}` - Detalhes de um veículo
- `POST /api/submissions` - Criar solicitação (consignar/vender)

**Protegidos (requer token):**
- `GET /api/submissions` - Listar todas solicitações
- `PUT /api/submissions/{id}` - Atualizar status
- `DELETE /api/submissions/{id}` - Excluir solicitação
- `POST /api/vehicles` - Cadastrar novo veículo
- `PUT /api/vehicles/{id}` - Atualizar veículo
- `DELETE /api/vehicles/{id}` - Excluir veículo

**Credenciais padrão:**
- Username: `admin`
- Password: `admin123`

---

## 📱 FRONTEND

### 1. **Tela Inicial** (`app/index.tsx`)

**Componentes principais:**
- Logo DM MOTORS + endereço
- Banner de boas-vindas
- 4 botões principais:
  - 🚗 Consignar meu Veículo
  - 💰 Vender meu Veículo
  - 🔍 Comprar Veículo
  - 📱 Falar no WhatsApp (abre app com número 32 99926-4848)
- Link para acesso administrativo

**Cores:**
- Primary: #FF0000 (Vermelho)
- Black: #000000
- White: #FFFFFF
- Gray: #666666

---

### 2. **Formulário de Consignação/Venda** (`app/submission-form.tsx`)

**Campos do formulário:**
- Nome completo *
- Telefone com DDD *
- Marca do veículo *
- Modelo *
- Ano *
- Cor *
- Quilometragem (km) *
- Observações (opcional)
- Fotos do veículo * (até 6 fotos)

**Funcionalidades:**
- Upload de fotos da galeria
- Tirar foto com câmera
- Remover fotos
- Validação completa de campos
- Envio para API
- Feedback de sucesso/erro

---

### 3. **Lista de Veículos** (`app/(tabs)/vehicles.tsx`)

**Funcionalidades:**
- Lista de veículos cadastrados
- Pull-to-refresh
- Cards com:
  - Foto do veículo
  - Marca e Modelo
  - Ano, KM, Cor
  - Preço formatado
  - Botão "Tenho Interesse" (abre WhatsApp)
- Estado vazio quando não há veículos

---

### 4. **Login Admin** (`app/admin-login.tsx`)

**Componentes:**
- Campo de usuário
- Campo de senha (com toggle show/hide)
- Botão de login
- Dica das credenciais padrão
- Loading state
- Salvamento do token no AsyncStorage

---

### 5. **Painel Admin** (`app/(tabs)/admin.tsx`)

**Dashboard:**
- Cards com estatísticas:
  - Pendentes (amarelo)
  - Aprovados (verde)
  - Rejeitados (vermelho)

**Lista de Solicitações:**
- Tipo (CONSIGNAR/VENDER)
- Dados do veículo
- Dados do cliente
- Status atual
- Botões de ação:
  - ✅ Aprovar
  - ❌ Rejeitar
  - 🗑️ Excluir

**Gerenciamento:**
- Filtros por status
- Ordenação por data (mais recentes primeiro)
- Atualização em tempo real
- Logout

---

## ⚙️ CONFIGURAÇÕES

### `app.json`
```json
{
  "expo": {
    "name": "DM Motors",
    "slug": "dm-motors",
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Tire fotos do veículo",
        "NSPhotoLibraryUsageDescription": "Selecione fotos da galeria"
      }
    }
  }
}
```

### Dependências principais (`package.json`)
```json
{
  "dependencies": {
    "expo": "54.0.33",
    "expo-router": "~6.0.22",
    "expo-image-picker": "17.0.10",
    "@react-native-async-storage/async-storage": "2.2.0",
    "axios": "1.14.0",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "react-native": "0.81.5",
    "react": "19.1.0"
  }
}
```

### Backend requirements.txt
```
fastapi
uvicorn
motor
pydantic
python-dotenv
bcrypt
pyjwt
python-multipart
```

---

## 🔑 VARIÁVEIS DE AMBIENTE

### Frontend (`.env`)
```
EXPO_PUBLIC_BACKEND_URL=https://concessionaria-hub.preview.emergentagent.com
```

### Backend (`.env`)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=dm_motors
JWT_SECRET=dm_motors_secret_key_2025
```

---

## 📊 MODELOS DE DADOS

### Submission (Solicitação)
```typescript
{
  id: string
  type: "consignar" | "vender"
  client_name: string
  phone: string
  brand: string
  model: string
  year: number
  mileage: number
  color: string
  observations: string
  photos: string[]  // base64
  status: "pending" | "approved" | "rejected"
  created_at: datetime
}
```

### Vehicle (Veículo)
```typescript
{
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  color: string
  price: number
  description: string
  photos: string[]  // base64
  created_at: datetime
}
```

---

## 🎨 DESIGN SYSTEM

### Cores
```javascript
const COLORS = {
  primary: "#FF0000",    // Vermelho DM Motors
  white: "#FFFFFF",      // Branco
  black: "#000000",      // Preto
  gray: "#666666",       // Cinza texto
  lightGray: "#F5F5F5",  // Cinza fundo
};
```

### Touch Targets
- Mínimo: 48px (Android) / 44px (iOS)
- Todos os botões respeitam esta regra

### Tipografia
- Títulos: 24-32px, bold
- Subtítulos: 18-20px, semibold
- Corpo: 14-16px, regular

---

## 🚀 COMO RODAR

### Backend
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd /app/frontend
yarn install
yarn start
```

---

## 📝 PRÓXIMOS PASSOS PARA CUSTOMIZAÇÃO

### Para adicionar novos campos:
1. Atualizar modelo no `backend/server.py`
2. Adicionar campo no formulário `submission-form.tsx`
3. Atualizar exibição no painel admin `(tabs)/admin.tsx`

### Para mudar cores:
1. Atualizar objeto `COLORS` em cada arquivo
2. Manter consistência em toda aplicação

### Para adicionar novas telas:
1. Criar arquivo em `/app/frontend/app/`
2. Adicionar rota no `_layout.tsx`
3. Criar navegação necessária

---

## 🆘 SUPORTE

**Credenciais de teste:**
- Admin: `admin` / `admin123`

**API Base URL:**
- `https://concessionaria-hub.preview.emergentagent.com/api`

**WhatsApp configurado:**
- Número: `32 99926-4848`

---

**Desenvolvido para DM MOTORS** 🚗
*Rua Eliaquim Sales, 85 - Santo Antônio de Pádua*
