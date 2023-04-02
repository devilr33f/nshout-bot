import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

export const encrypt = (text: string) => {
  const [key, iv] = [randomBytes(32), randomBytes(12)]
  const cipher = createCipheriv('chacha20-poly1305', key, iv)
  const cipherText = Buffer.concat([
    cipher.update(text, 'utf-8'),
    cipher.final(),
  ])

  return { key, iv, cipherText }
}

export const keyEncrypt = (user: string, key: Buffer, iv: Buffer) => {
  const payload = `${key.toString('hex')}:${iv.toString('hex')}`
  const userHash = createHash('sha256').update(user, 'utf-8').digest()

  const cipher = createCipheriv('aes-256-ecb', userHash, null)
  const cipherText = Buffer.concat([
    cipher.update(payload, 'utf8'),
    cipher.final(),
  ])

  return cipherText
}

export const decrypt = (key: Buffer, iv: Buffer, cipherText: string) => {
  const decipher = createDecipheriv('chacha20-poly1305', key, iv)
  const result = decipher.update(cipherText, 'base64')

  return result
}

export const keyDecrypt = (user: string, cipherText: string) => {
  const userHash = createHash('sha256').update(user, 'utf-8').digest()

  const decipher = createDecipheriv('aes-256-ecb', userHash, null)
  const result = Buffer.concat([
    decipher.update(cipherText, 'base64'),
    decipher.final(),
  ])

  return result
}
