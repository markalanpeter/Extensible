/* @private
 * This is an internal helper class for the calendar views and should not be overridden.
 * It is responsible for the base event rendering logic underlying all views based on a 
 * box-oriented layout that supports day spanning (MonthView, MultiWeekView, DayHeaderView).
 */
Extensible.calendar.util.WeekEventRenderer = function(){
    
    var getEventRow = function(id, week, index){
        var indexOffset = 1; //skip row with date #'s
        var evtRow, wkRow = Ext.get(id+'-wk-'+week);
        if(wkRow){
            var table = wkRow.child('.ext-cal-evt-tbl', true);
            evtRow = table.tBodies[0].childNodes[index+indexOffset];
            if(!evtRow){
                evtRow = Ext.DomHelper.append(table.tBodies[0], '<tr></tr>');
            }
        }
        return Ext.get(evtRow);
    };
    
    return {
        render: function(o){
            var w = 0, grid = o.eventGrid, 
                dt = Ext.Date.clone(o.viewStart),
                eventTpl = o.tpl,
                max = o.maxEventsPerDay != undefined ? o.maxEventsPerDay : 999,
                weekCount = o.weekCount < 1 ? 6 : o.weekCount,
                dayCount = o.weekCount == 1 ? o.dayCount : 7;
            
            for(; w < weekCount; w++){
                var row, d = 0, wk = grid[w];
                var startOfWeek = Ext.Date.clone(dt);
                var endOfWeek = Ext.ensible.Date.add(startOfWeek, {days: dayCount, millis: -1});
                
                for(; d < dayCount; d++){
                    if(wk && wk[d]){
                        var ev = emptyCells = skipped = 0,
                            day = wk[d], ct = day.length, evt;
                        
                        for(; ev < ct; ev++){
                            if(!day[ev]){
                                emptyCells++;
                                continue;
                            }
                            if(emptyCells > 0 && ev-emptyCells < max){
                                row = getEventRow(o.id, w, ev-emptyCells);
                                var cellCfg = {
                                    tag: 'td',
                                    cls: 'ext-cal-ev',
                                    html: '&#160;',
                                    id: o.id+'-empty-'+ct+'-day-' + Ext.Date.format(dt, 'Ymd')
                                }
                                if(emptyCells > 1 && max-ev > emptyCells){
                                    cellCfg.rowspan = Math.min(emptyCells, max-ev);
                                }
                                Ext.DomHelper.append(row, cellCfg);
                                emptyCells = 0;
                            }
                            
                            if(ev >= max){
                                skipped++;
                                continue;
                            }
                            evt = day[ev];
                            
                            if(!evt.isSpan || evt.isSpanStart){ //skip non-starting span cells
                                var item = evt.data || evt.event.data;
                                item._weekIndex = w;
                                item._renderAsAllDay = item[Extensible.calendar.data.EventMappings.IsAllDay.name] || evt.isSpanStart;
                                item.spanLeft = item[Extensible.calendar.data.EventMappings.StartDate.name].getTime() < startOfWeek.getTime();
                                item.spanRight = item[Extensible.calendar.data.EventMappings.EndDate.name].getTime() > endOfWeek.getTime();
                                item.spanCls = (item.spanLeft ? (item.spanRight ? 'ext-cal-ev-spanboth' : 
                                    'ext-cal-ev-spanleft') : (item.spanRight ? 'ext-cal-ev-spanright' : ''));
                                        
                                var row = getEventRow(o.id, w, ev),
                                    cellCfg = {
                                        tag: 'td',
                                        cls: 'ext-cal-ev',
                                        cn : eventTpl.apply(o.templateDataFn(item))
                                    },
                                    diff = Ext.ensible.Date.diffDays(dt, item[Extensible.calendar.data.EventMappings.EndDate.name]) + 1,
                                    cspan = Math.min(diff, dayCount-d);
                                    
                                if(cspan > 1){
                                    cellCfg.colspan = cspan;
                                }
                                Ext.DomHelper.append(row, cellCfg);
                            }
                        }
                        if(ev > max){
                            row = getEventRow(o.id, w, max);
                            Ext.DomHelper.append(row, {
                                tag: 'td',
                                cls: 'ext-cal-ev-more',
                                id: 'ext-cal-ev-more-'+Ext.Date.format(dt, 'Ymd'),
                                cn: {
                                    tag: 'a',
                                    html: Ext.String.format(o.getMoreText(skipped), skipped)
                                }
                            });
                        }
                        if(ct < o.evtMaxCount[w]){
                            row = getEventRow(o.id, w, ct);
                            if(row){
                                var cellCfg = {
                                    tag: 'td',
                                    cls: 'ext-cal-ev',
                                    //html: '&#160;',
                                    id: o.id+'-empty-'+(ct+1)+'-day-'+Ext.Date.format(dt, 'Ymd')
                                };
                                var rowspan = o.evtMaxCount[w] - ct;
                                if(rowspan > 1){
                                    cellCfg.rowspan = rowspan;
                                }
                                Ext.DomHelper.append(row, cellCfg);
                            }
                        }
                    }else{
                        row = getEventRow(o.id, w, 0);
                        if(row){
                            var cellCfg = {
                                tag: 'td',
                                cls: 'ext-cal-ev',
                                html: '&#160;',
                                id: o.id+'-empty-day-'+Ext.Date.format(dt, 'Ymd')
                            };
                            if(o.evtMaxCount[w] > 1){
                                cellCfg.rowspan = o.evtMaxCount[w];
                            }
                            Ext.DomHelper.append(row, cellCfg);
                        }
                    }
                    dt = Ext.ensible.Date.add(dt, {days: 1});
                }
            }
        }
    };
}();