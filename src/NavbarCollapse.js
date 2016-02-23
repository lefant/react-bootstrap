import React, { PropTypes } from 'react';
import tbsUtils from './utils/bootstrapUtils';
import Collapse from './Collapse';

let NavbarCollapse = React.createClass({

  contextTypes: {
    $bs_navbar_bsClass: PropTypes.string,
    $bs_navbar_expanded: PropTypes.bool
  },

  render() {
    let { children, onSelect, ...props } = this.props;
    let {
      $bs_navbar_bsClass: bsClass = 'navbar',
      $bs_navbar_expanded: expanded,
    } = this.context;

    return (
      <Collapse in={expanded} {...props}>
        <div className={tbsUtils.prefix({ bsClass }, 'collapse')}>
          { React.Children.map(this.props.children, function(child) {
            return React.cloneElement(child, {onSelect});
          }) }
        </div>
      </Collapse>
    );
  }
});

export default NavbarCollapse;
