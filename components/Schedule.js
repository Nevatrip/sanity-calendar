import uuid from '@sanity/uuid';
import React from 'react';
import PropTypes from 'prop-types';

import client from 'part:@sanity/base/client'
import {PatchEvent, set, unset, setIfMissing, insert} from 'part:@sanity/form-builder/patch-event'

import $ from 'jquery'
import '@progress/kendo-ui';
import '@progress/kendo-ui/js/kendo.timezones';
import '@progress/kendo-ui/js/cultures/kendo.culture.ru-RU';

const createPatchFrom = value => {
  console.log( 'createPatchFrom', value );
  return PatchEvent.from(set(value));
};

export default class Schedule extends React.Component {
  constructor() {
    super();

    this.state = {
      events: []
    };
  }

  render() {
    const { value } = this.props;

    return (
      <div>
        <link rel="stylesheet" href="http://kendo.cdn.telerik.com/2018.3.1017/styles/kendo.common.min.css" />
        <link rel="stylesheet" href="http://kendo.cdn.telerik.com/2018.3.1017/styles/kendo.default.min.css" />
        <div className="schedule" ref={ el => this.el = el } />
        {/*<pre><code>{ JSON.stringify( (value || []).map( ({ _key, title }) => ({ _key, title }) ), null, 2 ) }</code></pre>*/}
      </div>
    )
  }

  addEvent = ( eventArr, cb ) => {
    const { onChange } = this.props;
    const { events } = this.state;

    const newEvent = eventArr.map( event => {
      event._key = uuid();
      return event;
    } );

    const newValue = JSON.parse( JSON.stringify( [ ...events, ...newEvent ] ) );
    const save = PatchEvent.from( set( newValue ) ); 

    this.setState({
      events: save.patches[0].value
    }, () => {
      onChange( save );
      cb.success( newEvent );
    })
  }

  editEvent = ( eventArr, cb ) => {
    const { onChange } = this.props;
    const { events } = this.state;
    const normalize = {};

    events.forEach( event => {
      normalize[ event._key ] = event;
    } )

    eventArr.forEach( updatedEvent => {
      normalize[ updatedEvent._key ] = updatedEvent;
    } )

    const newValue = Object.keys( normalize ).map( key => {
      return normalize[ key ]
    } );

    this.setState({
      events: newValue
    }, () => {
      const newValueJSON = JSON.parse( JSON.stringify( newValue ) );
      onChange(PatchEvent.from(set( newValueJSON )));
      cb.success(cb.data.models);
    })
  }

  deleteEvent = ( eventArr, cb ) => {
    const { onChange } = this.props;
    const { events } = this.state;
    const newValue = events.filter( event => event._key !== eventArr[0]._key )

    this.setState({
      events: newValue
    }, () => {
      const newValueJSON = JSON.parse( JSON.stringify( newValue ) );
      onChange(PatchEvent.from(set( newValueJSON )));
      cb.success(cb.data.models)
    })
  }

  componentDidMount() {
    const { value, onChange, type } = this.props;
    this.setState({
      events: value || []
    });

    kendo.culture( 'ru-RU' );

    this.$el = $( this.el );
    this.$el.kendoScheduler({
      date: new Date(),
      startTime: new Date(),
      height: 900,
      views: [
        { type: 'day' },
        { type: 'week' },
        { type: 'month', selected: true },
        { type: 'agenda' }
      ],
      timezone: 'Europe/Moscow',
      dataSource: {
          batch: true,
          transport: {
            read: response => {
              response.success(value || []);
            },
            update: response => {
              this.editEvent( response.data.models, response )
            },
            create: response => {
              this.addEvent( response.data.models, response );
            },
            destroy: response => {
              this.deleteEvent( response.data.models, response );
            },
          },
          schema: {
            type: 'json',
            // data: 'events',
            model: {
              id: '_key',
              fields: {
                _key: { from: '_key', type: 'string' },
                _type: { from: '_type', type: 'string', defaultValue: 'event' },
                start: { from: 'start' , type: 'date'},
                end: { from: 'end' , type: 'date'},
                title: { from: 'title', type: 'string', defaultValue: 'No title' },
                startTimezone: { from: 'startTimezone' },
                endTimezone: { from: 'endTimezone' },
                description: { from: 'description' },
                recurrenceId: { from: 'recurrenceID' },
                recurrenceRule: { from: 'recurrenceRule' },
                recurrenceException: { from: 'recurrenceException' },
                isAllDay: { type: 'boolean', from: 'isAllDay' }
              }
            }
          }
      }
    });

    this.scheduler = this.$el.data("kendoScheduler");

    const fitWidget = () => {
      var widget = this.scheduler;
      var height = $(window).outerHeight();

      //size widget to take the whole view
      widget.element.height(height);
      widget.resize(true);
    }

    $(window).resize(function() {
      clearTimeout(window._resizeId);
      window._resizeId = setTimeout(function() {
        fitWidget();
      }, 500);
    });

    setTimeout( fitWidget, 1000 );

    fitWidget();
  }

  componentWillUnmount() {
    this.scheduler.destroy();
  }

  focus() {
    this.el.focus();
  }
}