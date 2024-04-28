/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as CollectionsDocumentsDocIDImport } from './routes/collections_/documents_/$docID'

// Create Virtual Routes

const StudyLazyImport = createFileRoute('/study')()
const SettingsLazyImport = createFileRoute('/settings')()
const CollectionsLazyImport = createFileRoute('/collections')()
const IndexLazyImport = createFileRoute('/')()
const CollectionsCollectionIDLazyImport = createFileRoute(
  '/collections/$collectionID',
)()

// Create/Update Routes

const StudyLazyRoute = StudyLazyImport.update({
  path: '/study',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/study.lazy').then((d) => d.Route))

const SettingsLazyRoute = SettingsLazyImport.update({
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/settings.lazy').then((d) => d.Route))

const CollectionsLazyRoute = CollectionsLazyImport.update({
  path: '/collections',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/collections.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const CollectionsCollectionIDLazyRoute =
  CollectionsCollectionIDLazyImport.update({
    path: '/collections/$collectionID',
    getParentRoute: () => rootRoute,
  } as any).lazy(() =>
    import('./routes/collections_/$collectionID.lazy').then((d) => d.Route),
  )

const CollectionsDocumentsDocIDRoute = CollectionsDocumentsDocIDImport.update({
  path: '/collections/documents/$docID',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/collections_/documents_/$docID.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/collections': {
      preLoaderRoute: typeof CollectionsLazyImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      preLoaderRoute: typeof SettingsLazyImport
      parentRoute: typeof rootRoute
    }
    '/study': {
      preLoaderRoute: typeof StudyLazyImport
      parentRoute: typeof rootRoute
    }
    '/collections/$collectionID': {
      preLoaderRoute: typeof CollectionsCollectionIDLazyImport
      parentRoute: typeof rootRoute
    }
    '/collections/documents/$docID': {
      preLoaderRoute: typeof CollectionsDocumentsDocIDImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexLazyRoute,
  CollectionsLazyRoute,
  SettingsLazyRoute,
  StudyLazyRoute,
  CollectionsCollectionIDLazyRoute,
  CollectionsDocumentsDocIDRoute,
])

/* prettier-ignore-end */
