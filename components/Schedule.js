import PropTypes from 'prop-types'
import React from 'react'
import client from 'part:@sanity/base/client'
import {PatchEvent, set, unset, setIfMissing} from 'part:@sanity/form-builder/patch-event'
import $ from 'jquery'
import '@progress/kendo-ui';
import '@progress/kendo-ui/js/kendo.timezones';
import '@progress/kendo-ui/js/cultures/kendo.culture.ru-RU';

export default class Schedule extends React.PureComponent {
  static propTypes = {
    type: PropTypes.shape({
      title: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string
    }).isRequired,

    value: PropTypes.shape({
      _ref: PropTypes.string.isRequired,
      _type: PropTypes.string.isRequired
    }),

    readOnly: PropTypes.bool,
    level: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }

  static defaultProps = {
    readOnly: false,
    value: undefined
  }

  state = {
    isLoading: true,
    events: []
  }

  constructor() {
    super();

    this.fetchObservable = client.observable
      .fetch( '*[_type == "calendar" && _id in path("*")]' )
      .subscribe( this.handleEventReceived )
  }

  handleEventReceived = events => {
    this.setState( {
      events: events,
      isLoading: false
    } )
  }

  componentDidMount() {
    const {
      events,
      isLoading
    } = this.state

    this.$el = $( this.el );

    kendo.culture( 'ru-RU' );
    this.$el.kendoScheduler({
      date: new Date(),
      startTime: new Date(),
      height: 900,
      views: [
        'day',
        'week',
        { type: 'month', selected: true },
        'agenda'
      ],
      timezone: 'Europe/Moscow',
      /*
      dataSource: {
        batch: true,
        transport: {
          read: () => events,
          update: ( response ) => { console.log( response ); },
          create: ( response ) => { console.log( response ); },
          destroy: ( response ) => { console.log( response ); },
        },
        schema: {
          type: 'json',
          data: 'result',
          model: {
            id: '_id',
            fields: {
              taskId: { from: '_id', type: 'string' },
              title: { from: 'title', defaultValue: 'No title', validation: { required: true } },
              start: { type: 'date', from: 'start' },
              end: { type: 'date', from: 'end' },
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
      */
    });

    const fitWidget = () => {
      var widget = this.$el.data("kendoScheduler");
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

    fitWidget();
  }

  componentWillUnmount() {
    this.fetchObservable.unsubscribe();
    this.$el.data("kendoScheduler").destroy();
  }

  render() {
    const { type, value, level, focusPath, onFocus, onBlur } = this.props
    const { events, isLoading } = this.state

    console.log( events );

    return (
      <>
        <link rel="stylesheet" href="http://kendo.cdn.telerik.com/2018.3.1017/styles/kendo.common.min.css" />
        <link rel="stylesheet" href="http://kendo.cdn.telerik.com/2018.3.1017/styles/kendo.default.min.css" />
        <div className="schedule" ref={ el => this.el = el }></div>
      </>
    )
  }
}