import rawFixtureData from '../../fixtures/hunch-analysis-fixtures.json'
import type { AnalysisFixture } from '../types/analysis'

export const analysisFixtures = rawFixtureData.fixtures as AnalysisFixture[]

export function getFixtureById(fixtureId: string): AnalysisFixture | undefined {
  return analysisFixtures.find((fixture) => fixture.id === fixtureId)
}

export function getFixtureTitle(fixtureId: string) {
  return getFixtureById(fixtureId)?.title ?? 'Untitled listing'
}
