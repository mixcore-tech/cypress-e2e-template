import { DataGenerator } from '@core/utils/data-generator'
import { IFeaturePayload } from './types/feature-payload'

/**
 * FILL-IN TEMPLATE — payload factory.
 *
 * Factories build VALID payloads with randomized data so every run is
 * idempotent; specs override only the fields they care about:
 *
 *   FeatureFactory.initializeFeaturePayload({ name: 'explicit-name' })
 */
export class FeatureFactory {
    static initializeFeaturePayload(overrides: Partial<IFeaturePayload> = {}): IFeaturePayload {
        return {
            name: DataGenerator.randomString(8),
            description: DataGenerator.randomString(15),
            // TODO(template): sensible defaults for the rest of your payload fields
            ...overrides
        }
    }
}
