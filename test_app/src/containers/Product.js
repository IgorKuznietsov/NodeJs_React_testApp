import React from 'react'

export default ({ match }) =>  
  (
      <div>
        Product PAGE
        {match.params.id}
      </div>
   
)