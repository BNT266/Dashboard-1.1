/* =============================================
   SECURITY EVENT DASHBOARD - app.js
   TEIL 1 von 5: Grundlagen
   ============================================= */

(function() {
    'use strict';

    console.log('Security Dashboard wird geladen...');

    // ==========================================
    // GLOBALER STATE
    // ==========================================
    window.AppState = {
        allData: [],
        currentData: [],
        headerMap: {},
        charts: {},
        initialized: false
    };

    // ==========================================
    // KONFIGURATION
    // ==========================================
    window.CONFIG = {
        riskWeights: {
            'Diebstahl': 9,
            'Verdaechtige Person': 7,
            'Zutrittsverletzung': 6,
            'Alarmanlage ausgeloest': 5,
            'Vandalismus': 8,
            'Einbruch': 10,
            'Brandschutz': 9
        },
        chartColors: [
            '#00a37a', '#006b4e', '#4caf50', '#8bc34a',
            '#cddc39', '#ffc107', '#ff9800', '#ff5722'
        ],
        maxChartItems: 6
    };

    // ==========================================
    // SPRACHEN (i18n)
    // ==========================================
    window.i18n = {
        current: 'de',

        set: function(lang) {
            this.current = (lang === 'de' || lang === 'en') ? lang : 'de';
            console.log('Sprache:', this.current);
        },

        t: function(key, vars) {
            vars = vars || {};
            var text = '';
            if (this.strings[key] && this.strings[key][this.current]) {
                text = this.strings[key][this.current];
            } else if (this.strings[key] && this.strings[key].de) {
                text = this.strings[key].de;
            } else {
                text = key;
            }
            // Variablen ersetzen
            for (var v in vars) {
                text = text.replace(new RegExp('\\{\\{' + v + '\\}\\}', 'g'), vars[v]);
            }
            return text;
        },

        strings: {
            pdf_title: {
                de: 'SECURITY EVENT DASHBOARD',
                en: 'SECURITY EVENT DASHBOARD'
            },
            pdf_subtitle: {
                de: 'Executive Summary Report',
                en: 'Executive Summary Report'
            },
            pdf_created: {
                de: 'Erstellt: {{date}}',
                en: 'Generated: {{date}}'
            },
            pdf_filename: {
                de: 'Security-Report-{{date}}.pdf',
                en: 'Security-Report-{{date}}.pdf'
            },
            section_summary: {
                de: 'Executive Summary',
                en: 'Executive Summary'
            },
            section_overview: {
                de: 'Aggregierte Uebersicht',
                en: 'Aggregated Overview'
            },
            key_facts: {
                de: 'Ereignisse: {{events}} | Laender: {{countries}} | Standorte: {{sites}} | Typen: {{types}}',
                en: 'Events: {{events}} | Countries: {{countries}} | Sites: {{sites}} | Types: {{types}}'
            },
            col_country: { de: 'Land', en: 'Country' },
            col_site: { de: 'Liegenschaft', en: 'Site' },
            col_type: { de: 'Ereignisart', en: 'Event Type' },
            col_count: { de: 'Anzahl', en: 'Count' },
            chart_countries: { de: 'Nach Laendern', en: 'By Country' },
            chart_sites: { de: 'Nach Standorten', en: 'By Site' },
            chart_types: { de: 'Nach Ereignisart', en: 'By Type' },
            chart_domains: { de: 'Bereichsverteilung', en: 'Domain Distribution' },
            footer_text: { de: 'Security Dashboard Report', en: 'Security Dashboard Report' },
            footer_page: { de: 'Seite {{page}}', en: 'Page {{page}}' },
            toast_testdata: { de: 'Testdaten geladen', en: 'Test data loaded' },
            toast_csv_loaded: { de: 'CSV geladen: {{name}}', en: 'CSV loaded: {{name}}' },
            toast_csv_error: { de: 'CSV Fehler: {{error}}', en: 'CSV Error: {{error}}' },
            toast_no_data: { de: 'Keine Daten vorhanden', en: 'No data available' },
            toast_csv_export: { de: 'CSV exportiert', en: 'CSV exported' },
            toast_pdf_start: { de: 'PDF wird erstellt...', en: 'Creating PDF...' },
            toast_pdf_done: { de: 'PDF erstellt', en: 'PDF created' },
            toast_pdf_error: { de: 'PDF Fehler: {{error}}', en: 'PDF Error: {{error}}' },
            filter_reset: { de: 'Filter zurueckgesetzt', en: 'Filters reset' },
            filter_all_countries: { de: 'Alle Laender', en: 'All Countries' },
            filter_all_sites: { de: 'Alle Liegenschaften', en: 'All Sites' },
            filter_all_types: { de: 'Alle Ereignisarten', en: 'All Event Types' },
            status_showing: { de: 'Zeige {{current}} von {{total}}', en: 'Showing {{current}} of {{total}}' },
            status_no_data: { de: 'Keine Daten geladen', en: 'No data loaded' },
            status_testdata: { de: 'Testdaten: {{count}} Events', en: 'Test data: {{count}} events' },
            status_csv: { de: '{{name}}: {{count}} Events', en: '{{name}}: {{count}} events' },
            risk_no_config: { de: 'Keine Ereignisarten. Bitte Daten laden.', en: 'No event types. Please load data.' },
            analytics_waiting: { de: 'Warte auf Daten...', en: 'Waiting for data...' },
            analytics_no_data: { de: 'Keine Daten fuer Analyse', en: 'No data for analysis' }
        }
    };

    // ==========================================
    // TESTDATEN
    // ==========================================
    window.TestData = {
        csv: [
            'Land;Liegenschaft;Ereignisart;Datum',
            'Deutschland;Mainz Campus;Zutrittsverletzung;2025-01-03 18:23',
            'Deutschland;Mainz Campus;Zutrittsverletzung;2025-01-04 22:10',
            'Deutschland;Mainz Campus;Alarmanlage ausgeloest;2025-01-05 05:11',
            'Deutschland;Berlin Research;Zutrittsverletzung;2025-02-01 08:45',
            'Deutschland;Berlin Research;Verdaechtige Person;2025-02-02 09:30',
            'Deutschland;Berlin Research;Verdaechtige Person;2025-02-04 14:05',
            'Deutschland;Muenchen Warehouse;Diebstahl;2025-03-01 23:50',
            'Deutschland;Muenchen Warehouse;Diebstahl;2025-03-02 21:40',
            'Deutschland;Muenchen Warehouse;Alarmanlage ausgeloest;2025-03-05 03:10',
            'Deutschland;Muenchen Warehouse;Zutrittsverletzung;2025-03-06 06:05',
            'USA;Cambridge Lab;Zutrittsverletzung;2025-01-10 11:15',
            'USA;Cambridge Lab;Verdaechtige Person;2025-01-12 19:05',
            'USA;Cambridge Lab;Alarmanlage ausgeloest;2025-01-15 20:45',
            'USA;San Diego Office;Verdaechtige Person;2025-02-10 17:20',
            'USA;San Diego Office;Verdaechtige Person;2025-02-12 18:10',
            'USA;San Diego Office;Diebstahl;2025-02-14 16:55',
            'USA;San Diego Office;Zutrittsverletzung;2025-02-16 07:40',
            'UK;London HQ;Zutrittsverletzung;2025-01-07 08:05',
            'UK;London HQ;Zutrittsverletzung;2025-01-09 09:15',
            'UK;London HQ;Verdaechtige Person;2025-01-11 10:30',
            'UK;London HQ;Alarmanlage ausgeloest;2025-01-13 21:55',
            'UK;Reading Plant;Diebstahl;2025-03-03 23:05',
            'UK;Reading Plant;Diebstahl;2025-03-06 22:50',
            'UK;Reading Plant;Zutrittsverletzung;2025-03-07 04:15',
            'Schweiz;Basel Site;Verdaechtige Person;2025-02-03 13:15',
            'Schweiz;Basel Site;Verdaechtige Person;2025-02-05 14:25',
            'Schweiz;Basel Site;Alarmanlage ausgeloest;2025-02-06 02:50',
            'Schweiz;Basel Site;Zutrittsverletzung;2025-02-08 06:30',
            'Belgien;Bruessel Office;Zutrittsverletzung;2025-01-20 07:40',
            'Belgien;Bruessel Office;Diebstahl;2025-01-22 20:10',
            'Belgien;Bruessel Office;Diebstahl;2025-01-23 21:20',
            'Belgien;Bruessel Office;Verdaechtige Person;2025-01-25 15:30'
        ].join('\n')
    };

    console.log('Teil 1 geladen: State, Config, i18n, TestData');

// ENDE TEIL 1 - NICHT SCHLIESSEN, TEIL 2 FOLGT DIREKT
 // ==========================================
// TEIL 2 von 5: Utils und UI Helper
// ==========================================

    // ==========================================
    // HILFSFUNKTIONEN (Utils)
    // ==========================================
    window.Utils = {
        // CSV parsen
        parseCSV: function(text) {
            if (!text || typeof text !== 'string') {
                return { headers: [], rows: [] };
            }

            var lines = text.split(/\r?\n/);
            var filteredLines = [];
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].trim() !== '') {
                    filteredLines.push(lines[i]);
                }
            }

            if (filteredLines.length === 0) {
                return { headers: [], rows: [] };
            }

            var delimiter = filteredLines[0].indexOf(';') >= 0 ? ';' : ',';
            var headerParts = filteredLines[0].split(delimiter);
            var headers = [];
            for (var h = 0; h < headerParts.length; h++) {
                headers.push(headerParts[h].trim());
            }

            var rows = [];
            for (var r = 1; r < filteredLines.length; r++) {
                var cells = filteredLines[r].split(delimiter);
                var row = {};
                for (var c = 0; c < headers.length; c++) {
                    row[headers[c]] = (cells[c] || '').trim();
                }
                rows.push(row);
            }

            return { headers: headers, rows: rows };
        },

        // Header-Map erstellen
        createHeaderMap: function(headers) {
            var map = {};
            for (var i = 0; i < headers.length; i++) {
                var h = headers[i];
                var lower = h.toLowerCase();

                if (lower.indexOf('land') >= 0 || lower.indexOf('country') >= 0) {
                    map.country = h;
                }
                if (lower.indexOf('liegenschaft') >= 0 || lower.indexOf('site') >= 0 || lower.indexOf('standort') >= 0) {
                    map.site = h;
                }
                if (lower.indexOf('ereignis') >= 0 || lower.indexOf('event') >= 0 || lower.indexOf('typ') >= 0 || lower.indexOf('type') >= 0) {
                    map.type = h;
                }
                if (lower.indexOf('datum') >= 0 || lower.indexOf('date') >= 0) {
                    map.date = h;
                }
            }
            return map;
        },

        // Gruppieren und Zaehlen
        groupAndCount: function(data, keyFn) {
            var map = {};
            for (var i = 0; i < data.length; i++) {
                var key = keyFn(data[i]);
                if (key) {
                    map[key] = (map[key] || 0) + 1;
                }
            }

            var result = [];
            for (var k in map) {
                if (map.hasOwnProperty(k)) {
                    result.push({ key: k, count: map[k] });
                }
            }

            result.sort(function(a, b) {
                return b.count - a.count;
            });

            return result;
        },

        // Bereich klassifizieren
        classifyDomain: function(row, headerMap) {
            var text = '';
            if (headerMap.type && row[headerMap.type]) {
                text = row[headerMap.type].toLowerCase();
            }

            var securityWords = ['diebstahl', 'einbruch', 'vandalismus', 'zutritt', 'verdaechtig', 'alarm', 'security', 'raub'];
            var fmWords = ['facility', 'aufzug', 'klima', 'heizung', 'wartung', 'strom', 'wasser', 'technik'];
            var sheWords = ['unfall', 'verletzung', 'brand', 'feuer', 'evakuierung', 'gefahr', 'sicherheit'];

            for (var s = 0; s < securityWords.length; s++) {
                if (text.indexOf(securityWords[s]) >= 0) return 'Security';
            }
            for (var f = 0; f < fmWords.length; f++) {
                if (text.indexOf(fmWords[f]) >= 0) return 'FM';
            }
            for (var h = 0; h < sheWords.length; h++) {
                if (text.indexOf(sheWords[h]) >= 0) return 'SHE';
            }

            return 'Other';
        },

        // HTML escapen
        escapeHtml: function(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        },

        // Datum formatieren
        formatDate: function(date) {
            var d = date || new Date();
            var day = String(d.getDate()).padStart(2, '0');
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var year = d.getFullYear();
            var hours = String(d.getHours()).padStart(2, '0');
            var mins = String(d.getMinutes()).padStart(2, '0');
            return day + '.' + month + '.' + year + ' ' + hours + ':' + mins;
        },

        // Datum fuer Dateinamen
        dateForFilename: function() {
            var d = new Date();
            var year = d.getFullYear();
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
        }
    };

    // ==========================================
    // UI HELPER
    // ==========================================
    window.UI = {
        // Toast anzeigen
        showToast: function(message, type, duration) {
            type = type || 'info';
            duration = duration || 4000;

            var container = document.getElementById('toastContainer');
            if (!container) {
                console.log('Toast:', message);
                return;
            }

            var toast = document.createElement('div');
            toast.className = 'toast toast-' + type;
            toast.textContent = message;
            container.appendChild(toast);

            setTimeout(function() {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(20px)';
                setTimeout(function() {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        },

        // Text in Element setzen
        setText: function(id, text) {
            var el = document.getElementById(id);
            if (el) {
                el.textContent = text;
            }
        },

        // HTML in Element setzen
        setHtml: function(id, html) {
            var el = document.getElementById(id);
            if (el) {
                el.innerHTML = html;
            }
        },

        // Element anzeigen/verstecken
        show: function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = '';
        },

        hide: function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        }
    };

    console.log('Teil 2 geladen: Utils, UI Helper');

// ENDE TEIL 2 - TEIL 3 FOLGT DIREKT
 // ==========================================
// TEIL 3 von 5: ChartManager und Analytics
// ==========================================

    // ==========================================
    // CHART MANAGER
    // ==========================================
    window.ChartManager = {
        // Chart erstellen
        create: function(canvasId, data, chartType, maxItems) {
            chartType = chartType || 'bar';
            maxItems = maxItems || CONFIG.maxChartItems;

            var canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn('Canvas nicht gefunden:', canvasId);
                return;
            }

            // Alten Chart zerstoeren
            if (AppState.charts[canvasId]) {
                AppState.charts[canvasId].destroy();
                delete AppState.charts[canvasId];
            }

            // Keine Daten
            if (!data || data.length === 0) {
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#999';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Keine Daten', canvas.width / 2, canvas.height / 2);
                return;
            }

            // Daten vorbereiten
            var chartData = data.slice(0, maxItems);
            var labels = [];
            var values = [];
            for (var i = 0; i < chartData.length; i++) {
                labels.push(chartData[i].key || '(leer)');
                values.push(chartData[i].count);
            }

            var colors = CONFIG.chartColors.slice(0, values.length);
            var bgColors = [];
            for (var c = 0; c < colors.length; c++) {
                bgColors.push(colors[c] + '99'); // Mit Transparenz
            }

            // Chart-Konfiguration
            var config = {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Anzahl',
                        data: values,
                        backgroundColor: bgColors,
                        borderColor: colors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: chartType === 'pie',
                            position: 'bottom'
                        }
                    },
                    scales: chartType === 'pie' ? {} : {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            };

            // Chart erstellen
            try {
                var ctx = canvas.getContext('2d');
                AppState.charts[canvasId] = new Chart(ctx, config);
            } catch (e) {
                console.error('Chart-Fehler:', e);
            }
        },

        // Alle Charts zerstoeren
        destroyAll: function() {
            for (var key in AppState.charts) {
                if (AppState.charts.hasOwnProperty(key) && AppState.charts[key]) {
                    AppState.charts[key].destroy();
                }
            }
            AppState.charts = {};
        }
    };

    // ==========================================
    // SECURITY ANALYTICS
    // ==========================================
    window.Analytics = {
        insights: {},

        // Analyse starten
        analyze: function(data, headerMap) {
            if (!data || data.length === 0) {
                this.insights = {};
                this.renderEmpty();
                return;
            }

            this.calculateRisk(data, headerMap);
            this.analyzePatterns(data, headerMap);
            this.analyzeDomains(data, headerMap);
            this.generateRecommendations();
            this.renderAll();
        },

        // Risiko berechnen
        calculateRisk: function(data, headerMap) {
            var byType = Utils.groupAndCount(data, function(row) {
                return headerMap.type ? row[headerMap.type] : '';
            });

            var totalRisk = 0;
            var maxRisk = 0;
            var highRiskCount = 0;
            var criticalTypes = [];

            for (var i = 0; i < byType.length; i++) {
                var item = byType[i];
                var weight = CONFIG.riskWeights[item.key] || 3;
                totalRisk += item.count * weight;
                maxRisk += item.count * 10;

                if (weight >= 8) {
                    highRiskCount += item.count;
                    criticalTypes.push(item);
                }
            }

            var score = Math.round((totalRisk / Math.max(maxRisk, 1)) * 100);
            var level, levelClass;

            if (score >= 70) {
                level = 'HOCH';
                levelClass = 'high';
            } else if (score >= 40) {
                level = 'MITTEL';
                levelClass = 'medium';
            } else {
                level = 'NIEDRIG';
                levelClass = 'low';
            }

            this.insights.risk = {
                score: score,
                level: level,
                levelClass: levelClass,
                highRiskCount: highRiskCount,
                totalCount: data.length,
                criticalTypes: criticalTypes
            };
        },

        // Muster analysieren
        analyzePatterns: function(data, headerMap) {
            var patterns = [];

            // Hotspots finden
            var bySite = Utils.groupAndCount(data, function(row) {
                return headerMap.site ? row[headerMap.site] : '';
            });

            var avgPerSite = data.length / Math.max(bySite.length, 1);
            var hotspots = [];

            for (var i = 0; i < bySite.length; i++) {
                if (bySite[i].count > avgPerSite * 1.5) {
                    hotspots.push(bySite[i]);
                }
            }

            if (hotspots.length > 0) {
                patterns.push({
                    type: 'hotspot',
                    title: hotspots.length + ' Hotspot(s) erkannt',
                    detail: hotspots[0].key + ': ' + hotspots[0].count + ' Events'
                });
            }

            // Konzentration pruefen
            var byType = Utils.groupAndCount(data, function(row) {
                return headerMap.type ? row[headerMap.type] : '';
            });

            if (byType.length > 0) {
                var topType = byType[0];
                var concentration = Math.round((topType.count / data.length) * 100);

                if (concentration > 40) {
                    patterns.push({
                        type: 'concentration',
                        title: 'Konzentration: ' + concentration + '%',
                        detail: '"' + topType.key + '" dominiert'
                    });
                }
            }

            this.insights.patterns = patterns;
        },

        // Bereiche analysieren
        analyzeDomains: function(data, headerMap) {
            var counts = { Security: 0, FM: 0, SHE: 0, Other: 0 };

            for (var i = 0; i < data.length; i++) {
                var domain = Utils.classifyDomain(data[i], headerMap);
                counts[domain]++;
            }

            var total = data.length || 1;
            var domains = [];

            for (var d in counts) {
                if (counts.hasOwnProperty(d)) {
                    domains.push({
                        name: d,
                        count: counts[d],
                        share: Math.round((counts[d] / total) * 100)
                    });
                }
            }

            domains.sort(function(a, b) { return b.count - a.count; });

            this.insights.domains = domains;
        },

        // Empfehlungen generieren
        generateRecommendations: function() {
            var recommendations = [];
            var risk = this.insights.risk;

            if (!risk) {
                this.insights.recommendations = [];
                return;
            }

            if (risk.level === 'HOCH') {
                recommendations.push({
                    icon: '🚨',
                    text: 'Sofortige Sicherheitsmassnahmen empfohlen'
                });
            }

            if (risk.criticalTypes && risk.criticalTypes.length > 0) {
                recommendations.push({
                    icon: '🔒',
                    text: 'Fokus auf: ' + risk.criticalTypes[0].key
                });
            }

            if (risk.totalCount > 20) {
                recommendations.push({
                    icon: '📊',
                    text: 'Regelmaessiges Monitoring etablieren'
                });
            }

            if (recommendations.length === 0) {
                recommendations.push({
                    icon: '✅',
                    text: 'Standardbetrieb fortfuehren'
                });
            }

            this.insights.recommendations = recommendations;
        },

        // Leere Anzeige
        renderEmpty: function() {
            var msg = i18n.t('analytics_no_data');
            UI.setHtml('riskAssessment', '<div class="insight-content">' + msg + '</div>');
            UI.setHtml('patternDetection', '<div class="insight-content">' + msg + '</div>');
            UI.setHtml('recommendations', '<div class="insight-content">' + msg + '</div>');
            UI.setHtml('trendForecast', '<div class="insight-content">' + msg + '</div>');
        },

        // Alles rendern
        renderAll: function() {
            this.renderRisk();
            this.renderPatterns();
            this.renderRecommendations();
            this.renderTrend();
        },

        // Risiko rendern
        renderRisk: function() {
            var risk = this.insights.risk;
            if (!risk) return;

            var html = '<div class="insight-card-inner risk-' + risk.levelClass + '">';
            html += '<div class="insight-value">' + risk.level + ' (' + risk.score + '%)</div>';
            html += '<div class="insight-detail">' + risk.highRiskCount + ' kritische von ' + risk.totalCount + ' Events</div>';

            if (risk.criticalTypes && risk.criticalTypes.length > 0) {
                html += '<div class="insight-detail">Top: ' + Utils.escapeHtml(risk.criticalTypes[0].key) + '</div>';
            }

            html += '</div>';
            UI.setHtml('riskAssessment', html);
        },

        // Muster rendern
        renderPatterns: function() {
            var patterns = this.insights.patterns || [];
            var domains = this.insights.domains || [];

            var html = '';

            if (patterns.length === 0) {
                html += '<div class="insight-detail">Keine kritischen Muster erkannt</div>';
            } else {
                for (var i = 0; i < patterns.length; i++)
                    {
                    html += '<div class="insight-detail">' + patterns[i].title + '</div>';
                }
            }

            // Domains anzeigen
            if (domains.length > 0) {
                var top = domains[0];
                html += '<div class="insight-detail" style="margin-top:8px;">';
                html += 'Top-Bereich: <strong>' + top.name + '</strong> (' + top.count + ', ' + top.share + '%)';
                html += '</div>';
            }

            UI.setHtml('patternDetection', html);
        },

        // Empfehlungen rendern
        renderRecommendations: function() {
            var recs = this.insights.recommendations || [];
            var html = '';

            for (var i = 0; i < recs.length; i++) {
                html += '<div class="insight-detail">';
                html += recs[i].icon + ' ' + recs[i].text;
                html += '</div>';
            }

            UI.setHtml('recommendations', html);
        },

        // Trend rendern
        renderTrend: function() {
            var risk = this.insights.risk;
            if (!risk) return;

            var trend = risk.score > 50 ? 'steigend' : 'stabil';
            var icon = risk.score > 50 ? '📈' : '➡️';

            var html = '<div class="insight-detail">';
            html += icon + ' Trend: ' + trend;
            html += '</div>';
            html += '<div class="insight-detail">' + risk.totalCount + ' Events analysiert</div>';

            UI.setHtml('trendForecast', html);
        }
    };

    console.log('Teil 3 geladen: ChartManager, Analytics');

// ENDE TEIL 3 - TEIL 4 FOLGT DIREKT
 // ==========================================
// TEIL 4 von 5: Filter, Render, DataManager
// ==========================================

    // ==========================================
    // FILTER MANAGER
    // ==========================================
    window.FilterManager = {
        // Filter anwenden
        apply: function() {
            var countryEl = document.getElementById('filterCountry');
            var siteEl = document.getElementById('filterSite');
            var typeEl = document.getElementById('filterType');

            var country = countryEl ? countryEl.value : '__ALL__';
            var site = siteEl ? siteEl.value : '__ALL__';
            var type = typeEl ? typeEl.value : '__ALL__';

            var filtered = [];

            for (var i = 0; i < AppState.allData.length; i++) {
                var row = AppState.allData[i];
                var hm = AppState.headerMap;

                var rowCountry = hm.country ? row[hm.country] : '';
                var rowSite = hm.site ? row[hm.site] : '';
                var rowType = hm.type ? row[hm.type] : '';

                var match = true;

                if (country !== '__ALL__' && rowCountry !== country) {
                    match = false;
                }
                if (site !== '__ALL__' && rowSite !== site) {
                    match = false;
                }
                if (type !== '__ALL__' && rowType !== type) {
                    match = false;
                }

                if (match) {
                    filtered.push(row);
                }
            }

            AppState.currentData = filtered;
            this.updateStatus();
            Renderer.renderAll();
        },

        // Filter zuruecksetzen
        reset: function() {
            var countryEl = document.getElementById('filterCountry');
            var siteEl = document.getElementById('filterSite');
            var typeEl = document.getElementById('filterType');

            if (countryEl) countryEl.value = '__ALL__';
            if (siteEl) siteEl.value = '__ALL__';
            if (typeEl) typeEl.value = '__ALL__';

            this.apply();
            UI.showToast(i18n.t('filter_reset'), 'success');
        },

        // Status aktualisieren
        updateStatus: function() {
            var current = AppState.currentData.length;
            var total = AppState.allData.length;
            var text = i18n.t('status_showing', { current: current, total: total });
            UI.setText('filterStatus', text);
        },

        // Filter-Optionen aktualisieren
        updateOptions: function() {
            var countries = {};
            var sites = {};
            var types = {};
            var hm = AppState.headerMap;

            for (var i = 0; i < AppState.allData.length; i++) {
                var row = AppState.allData[i];

                if (hm.country && row[hm.country]) {
                    countries[row[hm.country]] = true;
                }
                if (hm.site && row[hm.site]) {
                    sites[row[hm.site]] = true;
                }
                if (hm.type && row[hm.type]) {
                    types[row[hm.type]] = true;
                }
            }

            this.fillSelect('filterCountry', Object.keys(countries).sort(), i18n.t('filter_all_countries'));
            this.fillSelect('filterSite', Object.keys(sites).sort(), i18n.t('filter_all_sites'));
            this.fillSelect('filterType', Object.keys(types).sort(), i18n.t('filter_all_types'));
        },

        // Select befuellen
        fillSelect: function(selectId, values, placeholder) {
            var select = document.getElementById(selectId);
            if (!select) return;

            var currentValue = select.value;
            var html = '<option value="__ALL__">' + placeholder + '</option>';

            for (var i = 0; i < values.length; i++) {
                html += '<option value="' + Utils.escapeHtml(values[i]) + '">';
                html += Utils.escapeHtml(values[i]);
                html += '</option>';
            }

            select.innerHTML = html;

            // Vorherigen Wert wiederherstellen wenn moeglich
            var found = false;
            for (var j = 0; j < values.length; j++) {
                if (values[j] === currentValue) {
                    found = true;
                    break;
                }
            }
            if (found) {
                select.value = currentValue;
            }
        }
    };

    // ==========================================
    // RENDERER
    // ==========================================
    window.Renderer = {
        // Alles rendern
        renderAll: function() {
            this.renderKPIs();
            this.renderTables();
            this.renderCharts();
            Analytics.analyze(AppState.currentData, AppState.headerMap);
        },

        // KPIs rendern
        renderKPIs: function() {
            var total = AppState.allData.length;
            var current = AppState.currentData.length;
            var hm = AppState.headerMap;

            var countries = {};
            var sites = {};
            var types = {};

            for (var i = 0; i < AppState.allData.length; i++) {
                var row = AppState.allData[i];
                if (hm.country && row[hm.country]) countries[row[hm.country]] = true;
                if (hm.site && row[hm.site]) sites[row[hm.site]] = true;
                if (hm.type && row[hm.type]) types[row[hm.type]] = true;
            }

            UI.setText('kpiTotal', total);
            UI.setText('kpiFiltered', current + ' nach Filter');
            UI.setText('kpiCountries', Object.keys(countries).length);
            UI.setText('kpiSites', Object.keys(sites).length);
            UI.setText('kpiTypes', Object.keys(types).length);
        },

        // Tabellen rendern
        renderTables: function() {
            var data = AppState.currentData;
            var hm = AppState.headerMap;

            // Leere Tabellen wenn keine Daten
            if (data.length === 0) {
                this.setTableEmpty('tableCountry', 2);
                this.setTableEmpty('tableSite', 3);
                this.setTableEmpty('tableType', 2);
                return;
            }

            // Nach Land
            var byCountry = Utils.groupAndCount(data, function(row) {
                return hm.country ? row[hm.country] : '';
            });
            this.fillTable('tableCountry', byCountry, ['key', 'count']);

            // Nach Ereignisart
            var byType = Utils.groupAndCount(data, function(row) {
                return hm.type ? row[hm.type] : '';
            });
            this.fillTable('tableType', byType, ['key', 'count']);

            // Nach Liegenschaft (mit Land)
            var siteMap = {};
            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                var site = hm.site ? row[hm.site] : '';
                var country = hm.country ? row[hm.country] : '';
                var key = site + '||' + country;
                siteMap[key] = (siteMap[key] || 0) + 1;
            }

            var bySite = [];
            for (var k in siteMap) {
                if (siteMap.hasOwnProperty(k)) {
                    var parts = k.split('||');
                    bySite.push({
                        site: parts[0] || '(leer)',
                        country: parts[1] || '(leer)',
                        count: siteMap[k]
                    });
                }
            }
            bySite.sort(function(a, b) { return b.count - a.count; });
            this.fillTable('tableSite', bySite, ['site', 'country', 'count']);
        },

        // Tabelle befuellen
        fillTable: function(tableId, data, columns) {
            var table = document.getElementById(tableId);
            if (!table) return;

            var tbody = table.querySelector('tbody');
            if (!tbody) return;

            var html = '';
            for (var i = 0; i < data.length; i++) {
                html += '<tr>';
                for (var c = 0; c < columns.length; c++) {
                    var value = data[i][columns[c]];
                    html += '<td>' + Utils.escapeHtml(value) + '</td>';
                }
                html += '</tr>';
            }

            tbody.innerHTML = html;
        },

        // Leere Tabelle
        setTableEmpty: function(tableId, colspan) {
            var table = document.getElementById(tableId);
            if (!table) return;

            var tbody = table.querySelector('tbody');
            if (!tbody) return;

            tbody.innerHTML = '<tr><td colspan="' + colspan + '" class="empty-state">Keine Daten</td></tr>';
        },

        // Charts rendern
        renderCharts: function() {
            var data = AppState.currentData;
            var hm = AppState.headerMap;

            if (typeof Chart === 'undefined') {
                console.warn('Chart.js nicht geladen');
                return;
            }

            // Nach Land
            var byCountry = Utils.groupAndCount(data, function(row) {
                return hm.country ? row[hm.country] : '';
            });
            ChartManager.create('chartCountries', byCountry, 'bar');

            // Nach Liegenschaft
            var bySite = Utils.groupAndCount(data, function(row) {
                return hm.site ? row[hm.site] : '';
            });
            ChartManager.create('chartSites', bySite, 'bar');

            // Nach Typ
            var byType = Utils.groupAndCount(data, function(row) {
                return hm.type ? row[hm.type] : '';
            });
            ChartManager.create('chartTypes', byType, 'pie');

            // Nach Domain
            var domainCounts = { Security: 0, FM: 0, SHE: 0, Other: 0 };
            for (var i = 0; i < data.length; i++) {
                var domain = Utils.classifyDomain(data[i], hm);
                domainCounts[domain]++;
            }

            var domainData = [];
            for (var d in domainCounts) {
                if (domainCounts.hasOwnProperty(d) && domainCounts[d] > 0) {
                    domainData.push({ key: d, count: domainCounts[d] });
                }
            }
            ChartManager.create('chartDomains', domainData, 'pie');
        }
    };

    // ==========================================
    // DATA MANAGER
    // ==========================================
    window.DataManager = {
        // Testdaten laden
        loadTestData: function() {
            console.log('Lade Testdaten...');

            try {
                var parsed = Utils.parseCSV(TestData.csv);
                AppState.allData = parsed.rows;
                AppState.headerMap = Utils.createHeaderMap(parsed.headers);
                AppState.currentData = AppState.allData.slice();

                this.onDataLoaded('testdata', 'Testdaten');
                UI.showToast(i18n.t('toast_testdata'), 'success');
            } catch (e) {
                console.error('Testdaten-Fehler:', e);
                UI.showToast('Fehler: ' + e.message, 'error');
            }
        },

        // CSV laden
        loadCSV: function(file) {
            var self = this;
            console.log('Lade CSV:', file.name);

            var reader = new FileReader();

            reader.onload = function(e) {
                try {
                    var text = e.target.result;
                    var parsed = Utils.parseCSV(text);

                    if (parsed.rows.length === 0) {
                        throw new Error('CSV enthaelt keine Daten');
                    }

                    AppState.allData = parsed.rows;
                    AppState.headerMap = Utils.createHeaderMap(parsed.headers);
                    AppState.currentData = AppState.allData.slice();

                    self.onDataLoaded('csv', file.name);
                    UI.showToast(i18n.t('toast_csv_loaded', { name: file.name }), 'success');
                } catch (err) {
                    console.error('CSV-Fehler:', err);
                    UI.showToast(i18n.t('toast_csv_error', { error: err.message }), 'error');
                    UI.setText('fileStatus', 'Fehler: ' + err.message);
                }
            };

            reader.onerror = function() {
                UI.showToast('Datei konnte nicht gelesen werden', 'error');
            };

            reader.readAsText(file);
        },

        // Nach Daten-Laden
        onDataLoaded: function(mode, name) {
            var count = AppState.allData.length;

            // Status aktualisieren
            if (mode === 'testdata') {
                UI.setText('fileStatus', i18n.t('status_testdata', { count: count }));
                UI.setText('modeIndicator', 'Testdaten');
            } else {
                UI.setText('fileStatus', i18n.t('status_csv', { name: name, count: count }));
                UI.setText('modeIndicator', 'CSV: ' + name);
            }

            UI.setText('recordCount', count + ' Datensaetze');

            // Filter aktualisieren
            FilterManager.updateOptions();
            FilterManager.updateStatus();

            // Risiko-Konfiguration aktualisieren
            RiskConfigManager.render();

            // Alles rendern
            Renderer.renderAll();
        }
    };

    console.log('Teil 4 geladen: Filter, Render, DataManager');

// ENDE TEIL 4 - TEIL 5 FOLGT DIREKT
 // ==========================================
// TEIL 5 von 5: Export, RiskConfig, Theme, Init
// ==========================================

    // ==========================================
    // EXPORT MANAGER
    // ==========================================
    window.ExportManager = {
        // CSV exportieren
        toCSV: function() {
            var data = AppState.currentData;

            if (!data || data.length === 0) {
                UI.showToast(i18n.t('toast_no_data'), 'error');
                return;
            }

            try {
                var headers = Object.keys(data[0]);
                var csv = headers.join(',') + '\n';

                for (var i = 0; i < data.length; i++) {
                    var row = data[i];
                    var values = [];
                    for (var h = 0; h < headers.length; h++) {
                        var val = row[headers[h]] || '';
                        val = String(val).replace(/"/g, '""');
                        values.push('"' + val + '"');
                    }
                    csv += values.join(',') + '\n';
                }

                var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                var link = document.createElement('a');
                var filename = 'security-events-' + Utils.dateForFilename() + '.csv';

                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();

                URL.revokeObjectURL(link.href);
                UI.showToast(i18n.t('toast_csv_export'), 'success');
            } catch (e) {
                console.error('CSV-Export-Fehler:', e);
                UI.showToast('Export-Fehler: ' + e.message, 'error');
            }
        },

        // PDF exportieren
        toPDF: function() {
            var data = AppState.currentData;

            if (!data || data.length === 0) {
                UI.showToast(i18n.t('toast_no_data'), 'error');
                return;
            }

            if (typeof window.jspdf === 'undefined') {
                UI.showToast('jsPDF nicht geladen', 'error');
                return;
            }

            var btn = document.getElementById('exportPDF');
            if (btn) btn.disabled = true;

            UI.showToast(i18n.t('toast_pdf_start'), 'info');

            try {
                var jsPDF = window.jspdf.jsPDF;
                var pdf = new jsPDF('p', 'mm', 'a4');

                var pageWidth = pdf.internal.pageSize.getWidth();
                var pageHeight = pdf.internal.pageSize.getHeight();
                var margin = 15;
                var yPos = 20;

                // Header
                pdf.setFillColor(0, 163, 122);
                pdf.rect(0, 0, pageWidth, 28, 'F');

                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(16);
                pdf.text(i18n.t('pdf_title'), margin, 14);

                pdf.setFontSize(10);
                pdf.text(i18n.t('pdf_subtitle'), margin, 22);

                var dateStr = Utils.formatDate(new Date());
                var dateText = i18n.t('pdf_created', { date: dateStr });
                pdf.text(dateText, pageWidth - margin - pdf.getTextWidth(dateText), 22);

                // Content
                yPos = 38;
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(12);
                pdf.text(i18n.t('section_summary'), margin, yPos);
                yPos += 8;

                // Key Facts
                var hm = AppState.headerMap;
                var countries = {};
                var sites = {};
                var types = {};

                for (var i = 0; i < data.length; i++) {
                    var row = data[i];
                    if (hm.country && row[hm.country]) countries[row[hm.country]] = true;
                    if (hm.site && row[hm.site]) sites[row[hm.site]] = true;
                    if (hm.type && row[hm.type]) types[row[hm.type]] = true;
                }

                pdf.setFontSize(9);
                pdf.setTextColor(80, 80, 80);
                pdf.text(i18n.t('key_facts', {
                    events: data.length,
                    countries: Object.keys(countries).length,
                    sites: Object.keys(sites).length,
                    types: Object.keys(types).length
                }), margin, yPos);
                yPos += 12;

                // Charts einfuegen
                var addChart = function(canvasId, title) {
                    var canvas = document.getElementById(canvasId);
                    if (!canvas) return;

                    if (yPos > pageHeight - 70) {
                        pdf.addPage();
                        yPos = 20;
                    }

                    pdf.setFontSize(10);
                    pdf.setTextColor(0, 0, 0);
                    pdf.text(title, margin, yPos);
                    yPos += 4;

                    try {
                        var imgData = canvas.toDataURL('image/png', 1.0);
                        pdf.addImage(imgData, 'PNG', margin, yPos, pageWidth - 2 * margin, 45);
                        yPos += 50;
                    } catch (err) {
                        console.warn('Chart-Export-Fehler:', err);
                    }
                };

                addChart('chartCountries', i18n.t('chart_countries'));
                addChart('chartTypes', i18n.t('chart_types'));

                // Tabellen mit AutoTable
                if (pdf.autoTable) {
                    pdf.addPage();
                    yPos = 20;

                    pdf.setFontSize(12);
                    pdf.setTextColor(0, 0, 0);
                    pdf.text(i18n.t('section_overview'), margin, yPos);
                    yPos += 8;

                    // Nach Land
                    var byCountry = Utils.groupAndCount(data, function(r) {
                        return hm.country ? r[hm.country] : '';
                    });

                    pdf.autoTable({
                        startY: yPos,
                        head: [[i18n.t('col_country'), i18n.t('col_count')]],
                        body: byCountry.map(function(item) {
                            return [item.key || '(leer)', item.count];
                        }),
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [0, 163, 122] }
                    });

                    yPos = pdf.lastAutoTable.finalY + 10;

                    // Nach Typ
                    var byType = Utils.groupAndCount(data, function(r) {
                        return hm.type ? r[hm.type] : '';
                    });

                    pdf.autoTable({
                        startY: yPos,
                        head: [[i18n.t('col_type'), i18n.t('col_count')]],
                        body: byType.map(function(item) {
                            return [item.key || '(leer)', item.count];
                        }),
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [0, 163, 122] }
                    });
                }

                // Footer
                pdf.setFontSize(8);
                pdf.setTextColor(130, 130, 130);
                pdf.text(i18n.t('footer_text'), margin, pageHeight - 8);

                // Speichern
                var filename = i18n.t('pdf_filename', { date: Utils.dateForFilename() });
                pdf.save(filename);

                UI.showToast(i18n.t('toast_pdf_done'), 'success');
            } catch (e) {
                console.error('PDF-Fehler:', e);
                UI.showToast(i18n.t('toast_pdf_error', { error: e.message }), 'error');
            } finally {
                if (btn) btn.disabled = false;
            }
        }
    };

    // ==========================================
    // RISIKO-KONFIGURATION
    // ==========================================
    window.RiskConfigManager = {
        render: function() {
            var container = document.getElementById('riskConfig');
            if (!container) return;

            var hm = AppState.headerMap;
            var typesMap = {};

            for (var i = 0; i < AppState.allData.length; i++) {
                var row = AppState.allData[i];
                if (hm.type && row[hm.type]) {
                    typesMap[row[hm.type]] = true;
                }
            }

            var types = Object.keys(typesMap).sort();

            if (types.length === 0) {
                container.innerHTML = '<div class="status">' + i18n.t('risk_no_config') + '</div>';
                return;
            }

            var html = '';
            for (var t = 0; t < types.length; t++) {
                var type = types[t];
                var weight = CONFIG.riskWeights[type] || 3;

                html += '<div class="risk-config-row">';
                html += '<span class="risk-config-label" title="' + Utils.escapeHtml(type) + '">';
                html += Utils.escapeHtml(type);
                html += '</span>';
                html += '<input type="number" class="risk-config-input" ';
                html += 'min="1" max="10" value="' + weight + '" ';
                html += 'data-type="' + Utils.escapeHtml(type) + '">';
                html += '</div>';
            }

            container.innerHTML = html;

            // Event Listener
            var inputs = container.querySelectorAll('.risk-config-input');
            for (var j = 0; j < inputs.length; j++) {
                inputs[j].addEventListener('change', function(e) {
                    var input = e.target;
                    var type = input.getAttribute('data-type');
                    var value = parseInt(input.value, 10);

                    if (isNaN(value) || value < 1) value = 1;
                    if (value > 10) value = 10;
                    input.value = value;

                    CONFIG.riskWeights[type] = value;
                    Analytics.analyze(AppState.currentData, AppState.headerMap);
                });
            }
        }
    };

    // ==========================================
    // THEME MANAGER
    // ==========================================
    window.ThemeManager = {
        init: function() {
            var saved = localStorage.getItem('dashboard-theme') || 'light';
            this.set(saved);
        },

        toggle: function() {
            var current = document.documentElement.getAttribute('data-theme') || 'light';
            var newTheme = current === 'dark' ? 'light' : 'dark';
            this.set(newTheme);
        },

        set: function(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('dashboard-theme', theme);
            console.log('Theme:', theme);
        }
    };

    // ==========================================
    // APP INITIALISIERUNG
    // ==========================================
    window.App = {
        init: function() {
            console.log('Dashboard wird initialisiert...');

            // Theme laden
            ThemeManager.init();

            // Event Listener
            this.setupEventListeners();

            // Initial-Status
            UI.setText('filterStatus', i18n.t('status_no_data'));

            AppState.initialized = true;
            console.log('Dashboard bereit!');
        },

        setupEventListeners: function() {
            // Testdaten laden
            var loadBtn = document.getElementById('loadTestData');
            if (loadBtn) {
                loadBtn.addEventListener('click', function() {
                    DataManager.loadTestData();
                });
            }

            // CSV laden
            var fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.addEventListener('change', function(e) {
                    var file = e.target.files && e.target.files[0];
                    if (file) {
                        DataManager.loadCSV(file);
                    }
                });
            }

            // Filter
            var filterCountry = document.getElementById('filterCountry');
            var filterSite = document.getElementById('filterSite');
            var filterType = document.getElementById('filterType');

            if (filterCountry) {
                filterCountry.addEventListener('change', function() {
                    FilterManager.apply();
                });
            }
            if (filterSite) {
                filterSite.addEventListener('change', function() {
                    FilterManager.apply();
                });
            }
            if (filterType) {
                filterType.addEventListener('change', function() {
                    FilterManager.apply();
                });
            }

            var resetBtn = document.getElementById('resetFilters');
            if (resetBtn) {
                resetBtn.addEventListener('click', function() {
                    FilterManager.reset();
                });
            }

            // Export
            var csvBtn = document.getElementById('exportCSV');
            if (csvBtn) {
                csvBtn.addEventListener('click', function() {
                    ExportManager.toCSV();
                });
            }

            var pdfBtn = document.getElementById('exportPDF');
            if (pdfBtn) {
                pdfBtn.addEventListener('click', function() {
                    ExportManager.toPDF();
                });
            }

            // Theme
            var themeBtn = document.getElementById('themeToggle');
            if (themeBtn) {
                themeBtn.addEventListener('click', function() {
                    ThemeManager.toggle();
                });
            }

            // Sprache
            var langSelect = document.getElementById('reportLanguage');
            if (langSelect) {
                langSelect.addEventListener('change', function(e) {
                    i18n.set(e.target.value);
                });
            }

            console.log('Event Listener registriert');
        }
    };

    // ==========================================
    // START
    // ==========================================
    if (document.readyState === 'loading') {
        document.
            addEventListener('DOMContentLoaded', function() {
            App.init();
        });
    } else {
        App.init();
    }

    // Error Handler
    window.onerror = function(msg, url, line, col, error) {
        console.error('Fehler:', msg, 'Zeile:', line);
        return false;
    };

    console.log('Teil 5 geladen: Export, RiskConfig, Theme, Init');
    console.log('=== app.js vollstaendig geladen ===');

})();
