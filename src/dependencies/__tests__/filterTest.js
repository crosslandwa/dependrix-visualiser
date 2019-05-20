import createStore from '../../store'
import {
  projectIds,
  availableScopes,
  libraryIds,
  isScopeAllowedByFilter,
  loadTree,
  updateProjectFilter,
  updateLibraryFilter,
  updateDependencyScopeFilter
} from '../interactions'
import { clearModelFromDom, injectModelIntoDom, project, dependency, model } from './helpers'

describe('Filtering', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  it('of projects is done with a fuzzy matching comma separated string', done => {
    const store = createStore()
    injectModelIntoDom(model(
      project('a1', '1.0.0'),
      project('a2', '2.0.0'),
      project('a3', '2.0.0')
    ))

    store.dispatch(loadTree())
      .then(() => {
        expect(projectIds(store.getState())).toEqual(['a1', 'a2', 'a3'])

        store.dispatch(updateProjectFilter('a1'))
        expect(projectIds(store.getState())).toEqual(['a1'])

        store.dispatch(updateProjectFilter('a'))
        expect(projectIds(store.getState())).toEqual(['a1', 'a2', 'a3'])

        store.dispatch(updateProjectFilter('a1, , 3')) // note empty search terms and additional whitespace
        expect(projectIds(store.getState())).toEqual(['a1', 'a3'])
      })
      .then(done, done.fail)
  })

  it('of libraries is done with a fuzzy matching comma separated string', done => {
    const store = createStore()
    injectModelIntoDom(model(
      project('a1', '1.0.0', dependency('d1', '1.0.0'), dependency('d2', '1.0.0'), dependency('d3', '1.0.0'))
    ))

    store.dispatch(loadTree())
      .then(() => {
        expect(libraryIds(store.getState())).toEqual(['d1', 'd2', 'd3'])

        store.dispatch(updateLibraryFilter('d1'))
        expect(libraryIds(store.getState())).toEqual(['d1'])

        store.dispatch(updateLibraryFilter('d'))
        expect(libraryIds(store.getState())).toEqual(['d1', 'd2', 'd3'])

        store.dispatch(updateLibraryFilter('d1, , 3')) // note empty search terms and additional whitespace
        expect(libraryIds(store.getState())).toEqual(['d1', 'd3'])
      })
      .then(done, done.fail)
  })

  describe('libraries by dependency scope', () => {
    it('is possible for all the existing scopes', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2')),
        project('a2', '1.0.0', dependency('d1', '1.0.0', 'scope3'), dependency('d3', '2.0.0'/* no scope */))
      ))

      store.dispatch(loadTree())
        .then(() => {
          expect(availableScopes(store.getState())).toEqual(['scope1', 'scope2', 'scope3'])
        })
        .then(done, done.fail)
    })

    it('is supported for a single scope', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2'), dependency('d3', '1.0.0', 'scope2'))
      ))

      store.dispatch(loadTree())
        .then(() => {
          store.dispatch(updateDependencyScopeFilter(['scope2']))
          expect(libraryIds(store.getState())).toEqual(['d2', 'd3'])
          expect(isScopeAllowedByFilter(store.getState(), 'scope1')).toEqual(false)
          expect(isScopeAllowedByFilter(store.getState(), 'scope2')).toEqual(true)
          expect(isScopeAllowedByFilter(store.getState(), 'bananas')).toEqual(false)

          store.dispatch(updateDependencyScopeFilter())
          expect(libraryIds(store.getState())).toEqual(['d1', 'd2', 'd3'])
        })
        .then(done, done.fail)
    })

    it('is supported for a multiple scopes at the same time', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2'), dependency('d3', '1.0.0', 'scope3')),
        project('a2', '1.0.0', dependency('d4', '1.0.0', 'scope2'))
      ))

      store.dispatch(loadTree())
        .then(() => {
          store.dispatch(updateDependencyScopeFilter(['scope1', 'scope2']))
          expect(libraryIds(store.getState())).toEqual(['d1', 'd2', 'd4'])
          expect(isScopeAllowedByFilter(store.getState(), 'scope1')).toEqual(true)
          expect(isScopeAllowedByFilter(store.getState(), 'scope2')).toEqual(true)
          expect(isScopeAllowedByFilter(store.getState(), 'scope3')).toEqual(false)
        })
        .then(done, done.fail)
    })
  })
})
