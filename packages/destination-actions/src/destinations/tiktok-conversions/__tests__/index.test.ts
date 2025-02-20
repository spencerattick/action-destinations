import nock from 'nock'
import { createTestEvent, createTestIntegration } from '@segment/actions-core'
import Definition from '../index'
import { Settings } from '../generated-types'

const testDestination = createTestIntegration(Definition)
const timestamp = '2021-09-2T15:21:15.449Z'
const settings: Settings = {
  accessToken: 'test',
  pixelCode: 'test'
}

describe('Tiktok Conversions', () => {
  describe('reportWebEvent', () => {
    it('should send a successful InitiateCheckout event to reportWebEvent', async () => {
      const event = createTestEvent({
        timestamp: timestamp,
        event: 'Checkout Started',
        messageId: 'corey123',
        type: 'track',
        properties: {
          email: 'coreytest1231@gmail.com',
          phone: '+1555-555-5555',
          ttclid: '12345',
          currency: 'USD',
          value: 100,
          query: 'shoes'
        },
        context: {
          page: {
            url: 'https://segment.com/',
            referrer: 'https://google.com/'
          },
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57',
          ip: '0.0.0.0'
        },
        userId: 'testId123'
      })

      nock('https://business-api.tiktok.com/open_api/v1.2/pixel/track').post('/').reply(200, {})
      const responses = await testDestination.testAction('reportWebEvent', {
        event,
        settings,
        useDefaultMappings: true,
        mapping: {
          event: 'InitiateCheckout'
        }
      })
      expect(responses.length).toBe(1)
      expect(responses[0].status).toBe(200)
      expect(responses[0].options.json).toMatchObject({
        pixel_code: 'test',
        event: 'InitiateCheckout',
        event_id: 'corey123_seg',
        timestamp: '2021-09-2T15:21:15.449Z',
        context: {
          user: {
            external_id: '481f202262e9c5ccc48d24e60798fadaa5f6ff1f8369f7ab927c04c3aa682a7f',
            phone_number: '910a625c4ba147b544e6bd2f267e130ae14c591b6ba9c25cb8573322dedbebd0',
            email: 'eb9869a32b532840dd6aa714f7a872d21d6f650fc5aa933d9feefc64708969c7'
          },
          ad: {
            callback: '12345'
          },
          page: {
            url: 'https://segment.com/',
            referrer: 'https://google.com/'
          },
          ip: '0.0.0.0',
          user_agent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57'
        },
        properties: {
          currency: 'USD',
          value: 100,
          query: 'shoes'
        }
      })
    })

    it('should send contents arrray properties to TikTok', async () => {
      const event = createTestEvent({
        timestamp: timestamp,
        event: 'Checkout Started',
        messageId: 'corey123',
        type: 'track',
        properties: {
          email: 'coreytest1231@gmail.com',
          phone: '+1555-555-5555',
          ttclid: '12345',
          currency: 'USD',
          value: 100,
          query: 'shoes',
          products: [{ price: 100, quantity: 2, category: 'Air Force One (Size S)', product_id: 'abc123' }]
        },
        context: {
          page: {
            url: 'https://segment.com/',
            referrer: 'https://google.com/'
          },
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57',
          ip: '0.0.0.0'
        },
        userId: 'testId123'
      })

      nock('https://business-api.tiktok.com/open_api/v1.2/pixel/track').post('/').reply(200, {})
      const responses = await testDestination.testAction('reportWebEvent', {
        event,
        settings,
        useDefaultMappings: true,
        mapping: {
          event: 'InitiateCheckout',
          contents: {
            '@arrayPath': [
              '$.properties.products',
              {
                price: {
                  '@path': '$.price'
                },
                quantity: {
                  '@path': '$.quantity'
                },
                content_type: {
                  '@path': '$.category'
                },
                content_id: {
                  '@path': '$.product_id'
                }
              }
            ]
          }
        }
      })

      expect(responses.length).toBe(1)
      expect(responses[0].status).toBe(200)
      expect(responses[0].options.body).toMatchInlineSnapshot(
        `"{\\"pixel_code\\":\\"test\\",\\"event\\":\\"InitiateCheckout\\",\\"event_id\\":\\"corey123_seg\\",\\"timestamp\\":\\"2021-09-2T15:21:15.449Z\\",\\"context\\":{\\"user\\":{\\"external_id\\":\\"481f202262e9c5ccc48d24e60798fadaa5f6ff1f8369f7ab927c04c3aa682a7f\\",\\"phone_number\\":\\"910a625c4ba147b544e6bd2f267e130ae14c591b6ba9c25cb8573322dedbebd0\\",\\"email\\":\\"eb9869a32b532840dd6aa714f7a872d21d6f650fc5aa933d9feefc64708969c7\\"},\\"ad\\":{\\"callback\\":\\"12345\\"},\\"page\\":{\\"url\\":\\"https://segment.com/\\",\\"referrer\\":\\"https://google.com/\\"},\\"ip\\":\\"0.0.0.0\\",\\"user_agent\\":\\"Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57\\"},\\"properties\\":{\\"contents\\":[{\\"price\\":100,\\"quantity\\":2,\\"content_type\\":\\"Air Force One (Size S)\\",\\"content_id\\":\\"abc123\\"}],\\"currency\\":\\"USD\\",\\"value\\":100,\\"query\\":\\"shoes\\"}}"`
      )
    })

    it('should coerce properties into the contents array', async () => {
      const event = createTestEvent({
        timestamp: timestamp,
        event: 'Checkout Started',
        messageId: 'corey123',
        type: 'track',
        properties: {
          email: 'coreytest1231@gmail.com',
          phone: '+1555-555-5555',
          ttclid: '12345',
          currency: 'USD',
          value: 100,
          query: 'shoes',
          price: 100,
          quantity: 2,
          category: 'Air Force One (Size S)',
          product_id: 'abc123'
        },
        context: {
          page: {
            url: 'https://segment.com/',
            referrer: 'https://google.com/'
          },
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57',
          ip: '0.0.0.0'
        },
        userId: 'testId123'
      })

      nock('https://business-api.tiktok.com/open_api/v1.2/pixel/track').post('/').reply(200, {})
      const responses = await testDestination.testAction('reportWebEvent', {
        event,
        settings,
        useDefaultMappings: true,
        mapping: {
          event: 'AddToCart',
          contents: {
            '@arrayPath': [
              '$.properties',
              {
                price: {
                  '@path': '$.price'
                },
                quantity: {
                  '@path': '$.quantity'
                },
                content_type: {
                  '@path': '$.category'
                },
                content_id: {
                  '@path': '$.product_id'
                }
              }
            ]
          }
        }
      })

      expect(responses.length).toBe(1)
      expect(responses[0].status).toBe(200)
      expect(responses[0].options.body).toMatchInlineSnapshot(
        `"{\\"pixel_code\\":\\"test\\",\\"event\\":\\"AddToCart\\",\\"event_id\\":\\"corey123_seg\\",\\"timestamp\\":\\"2021-09-2T15:21:15.449Z\\",\\"context\\":{\\"user\\":{\\"external_id\\":\\"481f202262e9c5ccc48d24e60798fadaa5f6ff1f8369f7ab927c04c3aa682a7f\\",\\"phone_number\\":\\"910a625c4ba147b544e6bd2f267e130ae14c591b6ba9c25cb8573322dedbebd0\\",\\"email\\":\\"eb9869a32b532840dd6aa714f7a872d21d6f650fc5aa933d9feefc64708969c7\\"},\\"ad\\":{\\"callback\\":\\"12345\\"},\\"page\\":{\\"url\\":\\"https://segment.com/\\",\\"referrer\\":\\"https://google.com/\\"},\\"ip\\":\\"0.0.0.0\\",\\"user_agent\\":\\"Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57\\"},\\"properties\\":{\\"contents\\":[{\\"price\\":100,\\"quantity\\":2,\\"content_type\\":\\"Air Force One (Size S)\\",\\"content_id\\":\\"abc123\\"}],\\"currency\\":\\"USD\\",\\"value\\":100,\\"query\\":\\"shoes\\"}}"`
      )
    })
  })
})
