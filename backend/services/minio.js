import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'minio.minio.svc:9000'
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'admin'
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'ChangeThisPassword123!'
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'interview-diagrams'
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true'

let client = null

function getClient() {
  if (!client) {
    client = new S3Client({
      endpoint: `http${MINIO_USE_SSL ? 's' : ''}://${MINIO_ENDPOINT}`,
      region: 'us-east-1', // MinIO ignores this but SDK requires it
      credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO
    })
  }
  return client
}

/**
 * Ensures the configured bucket exists. Called once at startup.
 */
export async function ensureBucket() {
  try {
    await getClient().send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }))
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      await getClient().send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }))
      console.log(`Created MinIO bucket: ${MINIO_BUCKET}`)
    } else {
      console.warn(`MinIO bucket check failed (may already exist): ${err.message}`)
    }
  }
}

/**
 * Stores a diagram (SVG or PNG) in MinIO.
 * @param {string} key - Object key, e.g. "diagrams/<conversationId>/<uuid>.svg"
 * @param {Buffer|string} body - File content
 * @param {string} contentType - MIME type (e.g. "image/svg+xml", "image/png")
 * @returns {Promise<string>} The object key
 */
export async function storeDiagram(key, body, contentType) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return key
}

/**
 * Retrieves a diagram from MinIO.
 * @param {string} key - Object key
 * @returns {Promise<{ body: Buffer, contentType: string }>}
 */
export async function getDiagram(key) {
  const result = await getClient().send(
    new GetObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
    })
  )

  const chunks = []
  for await (const chunk of result.Body) {
    chunks.push(chunk)
  }

  return {
    body: Buffer.concat(chunks),
    contentType: result.ContentType || 'image/svg+xml',
  }
}

export { MINIO_BUCKET }
