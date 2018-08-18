svg = d3.select 'svg'
width = svg.node().getBoundingClientRect().width
height = svg.node().getBoundingClientRect().height

# ZOOM
zoomable_layer = svg.append 'g'

zoom = d3.zoom()
  .scaleExtent([-Infinity,Infinity])
  .on 'zoom', () ->
    zoomable_layer
      .attrs
        transform: d3.event.transform

svg.call zoom

vis = zoomable_layer.append 'g'
  .attrs
    transform: "translate(#{width/2},#{height/2})"


# HIERARCHY
stratify = d3.stratify()
  .parentId (d) -> d.id.substring(0, d.id.lastIndexOf("."))

  
# PACK
w = width - 8
h = height - 8
pack = d3.pack()
  .size([w, h])
  .padding 3
  
# LINE
line = d3.line()
  .curve(d3.curveBundle.beta(1))
  .x (d) -> d.x
  .y (d) -> d.y
  
bubble_layer = vis.append 'g'
  .attrs
    transform: "translate(#{-w/2},#{-h/2})"
  

d3.csv 'flare.csv', (data) ->
  d3.csv 'flare_links.csv', (links_data) ->
    # LAYOUT
    
    # circle packing
    root = stratify(data)
      .sum (d) -> d.value
      .sort (a, b) -> d3.descending a.value, b.value

    pack(root)

    # bundling
    
    # index nodes & objectify links
    index = {}
    root.eachBefore (d) ->
      index[d.data.id] = d
    
    links_data.forEach (d) ->
      d.source = index[d.source]
      d.target = index[d.target]
      d.path = d.source.path d.target
    

    # bubbles
    bubbles = bubble_layer.selectAll '.bubble'
      .data root.descendants()

    enb = bubbles.enter().append 'circle'
      .attrs
        class: 'bubble'
        cx: (d) -> d.x
        cy: (d) -> d.y
        r: (d) -> d.r

    enb.append 'title'
      .text (d) -> d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join(' ')
      
    # links
    links = bubble_layer.selectAll '.link'
      .data links_data
      
    links.enter().append 'path'
      .attrs
        class: 'link'
        d: (d) -> line d.path
        