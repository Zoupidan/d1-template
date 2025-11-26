# 站点通信文档

## 概览
- 基础域名：`https://kongfuchong.fun`
- 认证方式：
  - 浏览器会话：`POST /auth`，设置 `alpha_session` Cookie 后访问受保护接口
  - 程序化令牌：在请求头携带 `Authorization: Bearer <API_TOKEN>` 或 `X-Api-Token: <API_TOKEN>`，可直接访问受保护接口
- 受保护接口：`/data`、`/theme`（需会话或令牌）
- 数据结构：与 `data.json` 保持一致，键为日期（`YYYY-MM-DD`），值包含 `calc[]`、`use[]` 等字段

## 环境变量
- `PASSWORD_PLAIN`：初始明文密码（例如 `114198`），用于派生校验
- `PASSWORD_SALT`：密码派生盐（默认 `alpha-salt-v1`）
- `SESSION_SECRET`：会话签名密钥（必需生产环境设置）
- `API_TOKEN`：程序化访问令牌（可选，设置后启用令牌访问）

## 认证
- 浏览器/脚本密码登录
  - `POST /auth`
  - 请求体：`application/json`，`{ "password": "114198" }`
  - 成功：返回 `302` 并设置 `alpha_session` Cookie（`HttpOnly`、`SameSite=Lax`、HTTPS 下 `Secure`）
  - 失败：`401`
- 程序化令牌
  - 请求头：`Authorization: Bearer <API_TOKEN>` 或 `X-Api-Token: <API_TOKEN>`
  - 无需 Cookie，直接访问受保护接口

## 接口定义

### 读取/更新数据
- `GET /data`
  - 说明：读取当前站点保存的全部数据（JSON）
  - 认证：需要会话或令牌
  - 响应：`200` + `application/json`
  - 参考实现：`src/index.ts:129-157`
- `POST /data`
  - 说明：保存整包数据（JSON 或文本），覆盖更新
  - 认证：需要会话或令牌
  - 请求体：
    - `application/json`：直接发送 JSON 文本
    - 其他（例如表单或纯文本）：作为字符串保存
  - 响应：成功 `204`，失败 `500`
  - 参考实现：`src/index.ts:141-155`

### 读取/更新主题
- `GET /theme`
  - 说明：读取当前保存的主题配置（JSON）
  - 认证：需要会话或令牌
  - 响应：`200` + `application/json`
  - 参考实现：`src/index.ts:100-127`
- `POST /theme`
  - 说明：保存主题配置（JSON），覆盖更新
  - 认证：需要会话或令牌
  - 请求体：`application/json`
  - 响应：成功 `204`，失败 `500`
  - 参考实现：`src/index.ts:112-125`

## 安全说明
- 会话安全：
  - Cookie：`HttpOnly`、`SameSite=Lax`、HTTPS 下 `Secure`
  - TTL：24 小时，过期需重新登录
- 密码派生与签名：
  - PBKDF2-SHA256（100000 次迭代）校验密码：`src/index.ts:29-43`, `src/index.ts:75-82`
  - HMAC-SHA256 会话签名：`src/index.ts:17-27`, `src/index.ts:86-89`
- 生产建议：
  - 设置强随机 `SESSION_SECRET` 与 `API_TOKEN`
  - 强制 `HTTPS` 访问域名
  - 限制上传体积与进行 JSON 结构校验（可后续增强）

## 示例

### 使用密码登录 + 上传数据（curl）

```bash
# 登录获取会话（302 设置 Cookie）
curl -i -X POST "https://kongfuchong.fun/auth" \
  -H "content-type: application/json" \
  --data '{"password":"114198"}'

# 使用浏览器已登录的 Cookie 上传数据（在脚本/终端中需手动带 Cookie）
curl -i -X POST "https://kongfuchong.fun/data" \
  -H "content-type: application/json" \
  -b "alpha_session=<你的cookie>" \
  --data @data.json

# 读取数据
curl -s "https://kongfuchong.fun/data" -b "alpha_session=<你的cookie>"
```

### 使用 API 令牌上传与读取（curl）

```bash
TOKEN="<API_TOKEN>"
curl -i -X POST "https://kongfuchong.fun/data" \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  --data @data.json

curl -s "https://kongfuchong.fun/data" -H "Authorization: Bearer $TOKEN"
```

### 使用 Python 脚本上传

```bash
pip install requests

# 使用密码登录上传
python scripts/upload_data.py \
  --base-url https://kongfuchong.fun \
  --password 114198 \
  --file data.json

# 使用 API 令牌上传（推荐）
python scripts/upload_data.py \
  --base-url https://kongfuchong.fun \
  --api-token <API_TOKEN> \
  --file data.json
```

## 前端行为（参考）
- 设置面板：支持上传 `data.json`，调用 `POST /data` 保存并刷新：`src/renderHtml.ts:101-107`, `src/renderHtml.ts:152-153`
- 页面加载：`GET /data` 拉取数据并标注当月有数据日期：`src/renderHtml.ts:167-169`
- 主题：设置面板应用后写入本地与服务端：`src/renderHtml.ts:141-151`

## 后续拓展建议
- 增量接口：`POST /data/<date>` 仅更新指定日期数据，保持结构一致
- 防重放签名：增加 `X-Alpha-Ts` 与 `X-Alpha-Signature`（`HMAC(secret, ts + method + path + body)`）校验时间漂移与签名匹配
- 上传校验：服务端校验字段类型与范围，限制最大体积与键数

