import React, { Component } from 'react';
import { connect } from 'react-redux'

import { Link } from 'react-router-dom'

class ClassifiersPage extends Component {
  render() {
    return(
      <div>
				<Link to = {'/goods/classifiers/_new'}>
					<button>ADD</button>
				</Link>
        ClassifiersPage
          {this.props.classifiers.map( (classifierObj) => {
            return (
              <div key = {classifierObj.id}>
                <Link to = {'/goods/classifiers/' + classifierObj.id}>
                    {classifierObj.name}
                </Link>
              </div>
            )                   
          } )}
        </div>
      )
    }
  }

const mapStateToProps = (state) => ({classifiers: state.goods.classifiers})

//const mapDispatchToProps = (dispatch) => ({login: (username, password) => {dispatch(login(username, password))}} )

export default connect(mapStateToProps/*, mapDispatchToProps*/)(ClassifiersPage)