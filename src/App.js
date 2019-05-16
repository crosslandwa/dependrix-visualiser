import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import LoadSummary from './dependencies/LoadSummary'
import DependencyMatrix from './dependencies/DependencyMatrix'
import ArtifactFilter from './filter/ArtifactFilter'
import DependencyFilter from './filter/DependencyFilter'

const mapStateToProps = state => ({})
const mapDispatchToProps = {}

const App = props => (
  <React.Fragment>
    <h1 class="header--xl">Dependrix</h1>
    <ArtifactFilter />
    <DependencyFilter />
    <LoadSummary />
    <DependencyMatrix />
  </React.Fragment>
)

export default connect(mapStateToProps, mapDispatchToProps)(App)
