import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GraphService } from './data/graph.service';
import * as _ from 'lodash';
import { MapComponent, MapEdge, MapItemType, MapNode } from '../classes/model.class';
import { Vector3 } from 'babylonjs';
import { MapHelperGraph } from './data/loader.service';
import { XMLParser } from 'fast-xml-parser';
import { MxCell, MxGeometry, MxGraphModel, MxGraphRoot, MxObject } from '../classes/mxgraph';

@Injectable({
  providedIn: 'root'
})
export class LoadAssetService {

  constructor(private graphService: GraphService, private http: HttpClient) {
  }

  loadModelFromApi(domainId: string): Promise<MapHelperGraph[]> {
    return new Promise<MapHelperGraph[]>((resolve) => {
      (async () => {
        // Load from mxgraph store on api side
        let graphData = await this.graphService.findAll();
        let domainGraph = _.filter(graphData, (data) => {
          return _.findIndex(data.domains, (domain: any) => {
            return domain.id === domainId;
          }) >= 0
        });
        // Iterate on graph data
        let worlds = _.flatMap(domainGraph, async (graph) => {
          let model = await this.loadDrawIoFromApi(graph.data);
          console.log(graph);
          console.log(model);

          const world: MapHelperGraph = {
            components: [],
            nodes: [],
            edges: []
          };

          if (model.root && model.root.mxObject) {
            world.components = _.flatMap(_.filter(model.root.mxObject, (_mxObject) => {
              // Component must have _component property
              return _mxObject.component != undefined
            }), (_mxObject) => {
              return <MapComponent>{
                id: _mxObject.id,
                uid: `component-${_mxObject.id}`,
                name: _mxObject.label,
                parent: _mxObject.mxCell.parent,
                width: _mxObject.mxCell.mxGeometry ? _mxObject.mxCell.mxGeometry.width : 10,
                height: _mxObject.mxCell.mxGeometry ? _mxObject.mxCell.mxGeometry.height : 10,
                weight: 0,
                type: MapItemType.cube,
                domains: [{
                  "id": domainId
                }],
                position: new Vector3(
                  _mxObject.mxCell.mxGeometry ? _mxObject.mxCell.mxGeometry.x : 0,
                  0,
                  _mxObject.mxCell.mxGeometry ? -_mxObject.mxCell.mxGeometry.y : 0)
              };
            });
          }

          // Iterate on each component
          world.nodes = _.flatMap(world.components, (_component) => {
            let _mxObjects = _.filter(model.root.mxObject, (_mxObject) => {
              return _mxObject.mxCell
                && _mxObject.id !== _component.id
                && _mxObject.mxCell.id !== _component.id
                && _mxObject.mxCell.parent === _component.parent
            });
            _component.nodes = _.flatMap(_mxObjects, (_mxObject) => {
              // Each cell must have a value
              if (_mxObject.mxCell.value === undefined) {
                console.error(`Cell ${_mxObject.mxCell.id} must have a value`);
                throw `Cell ${_mxObject.mxCell.id} must have a value`;
              }
              return this.buildNode(graph.id, _mxObject);
            });

            // Build edge
            world.edges = _.flatMap(_.filter(model.root.mxObject, (_mxObject) => {
              return _mxObject.mxCell.edge
            }), (_mxObject) => {
              return this.buildEdge(graph.id, _mxObject);
            });

            // Find parent
            let _mxParent = _.filter(model.root.mxObject, (_mxObject) => {
              return _mxObject
                && _mxObject.id === _component.parent
            });
            if (_mxParent.length !== 1) {
              console.error(`No parent ${_component.parent} found`);
              throw `No parent ${_component.parent} found`;
            }
            _component.holder = this.buildNode(graph.id, _mxParent[0]);

            // Distribute each element threw position
            _.each((_component.nodes), (_node) => {
              _node.position.x += _component.holder.position.x + _node.width / 2;
              _node.position.y += _component.holder.position.y;
              _node.position.z += _component.holder.position.z - _node.height / 2;
              _node.position.x += graph.position.x;
              _node.position.y += graph.position.y;
              _node.position.z += -graph.position.z;
            });
            _component.position.x += _component.holder.position.x + _component.width / 2;
            _component.position.y += _component.holder.position.y;
            _component.position.z += _component.holder.position.z - _component.height / 2;
            _component.position.x += graph.position.x;
            _component.position.y += graph.position.y;
            _component.position.z += -graph.position.z;

            return _component.nodes;
          });

          return world;
        });
        let result = await Promise.all(worlds);

        resolve(result);
      })();
    });
  }

  buildNode(prefix: string, _mxObject: any): MapNode {
    let id = _mxObject.mxCell.id ? _mxObject.mxCell.id : _mxObject.id;
    return <MapNode>{
      id: `${prefix}-${id}`,
      uid: `node-${prefix}-${id}`,
      name: _mxObject.mxCell.value,
      parent: _mxObject.mxCell.parent,
      width: _mxObject.mxCell.mxGeometry ? _mxObject.mxCell.mxGeometry.width : 10,
      height: _mxObject.mxCell.mxGeometry ? _mxObject.mxCell.mxGeometry.height : 10,
      weight: 0,
      type: MapItemType.cube,
      domains: [{
        "id": "1"
      }],
      position: new Vector3(
        _mxObject.mxCell.mxGeometry ? _mxObject.mxCell.mxGeometry.x : 0,
        0,
        _mxObject.mxCell.mxGeometry ? -_mxObject.mxCell.mxGeometry.y : 0)
    };
  }

  buildEdge(prefix: string, _mxObject: any): MapEdge {
    let id = _mxObject.mxCell.id ? _mxObject.mxCell.id : _mxObject.id;
    return <MapEdge>{
      id: `${prefix}-${id}`,
      name: _mxObject.mxCell.value,
      source: `node-${prefix}-` + _mxObject.mxCell.source,
      target: `node-${prefix}-` + _mxObject.mxCell.target
    };
  }

  loadDrawIoFromApi(data: string): Promise<MxGraphModel> {
    return new Promise<MxGraphModel>((resolve) => {
      (async () => {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_"
        });
        let xmlData = parser.parse(data);
        const mxGraphModel: MxGraphModel = new MxGraphModel();
        mxGraphModel.root = new MxGraphRoot();
        mxGraphModel.root.mxObject = [];
        // Iterate on mxCell
        _.each(xmlData.mxGraphModel.root.mxCell, (_mxCell) => {
          let mxObject!: MxObject;
          mxObject = {
            id: _mxCell['@_id'],
            mxCell: this.buildMxCell(_mxCell)
          }
          mxGraphModel.root.mxObject.push(mxObject);
        });
        // Object field is not mandatory
        if (xmlData.mxGraphModel.root.object) {
          let allObjects = xmlData.mxGraphModel.root.object
          // Transform single object into array
          if (xmlData.mxGraphModel.root.object['@_id']) {
            allObjects = [xmlData.mxGraphModel.root.object];
          }
          // Iterate on object
          _.each(allObjects, (_mxObject) => {
            let mxObject!: MxObject;
            if (_mxObject['mxCell']) {
              // Object discover
              mxObject = {
                id: _mxObject['@_id'],
                label: _mxObject['@_label'],
                component: _mxObject['@_component'],
                mxCell: this.buildMxCell(_mxObject['mxCell'])
              }
            } else {
              let _mxCell = _mxObject['mxCell'];
              if (_mxCell['@_edge']) {
                // Edge
              } else {
                // Simple mxCell
                mxObject = {
                  id: _mxCell['@_id'],
                  mxCell: this.buildMxCell(_mxObject['mxCell'])
                }
              }
            }
            mxGraphModel.root.mxObject.push(mxObject);
          });
        }
        resolve(mxGraphModel);
      })();
    });
  }

  buildMxCell(_mxCell: any): MxCell {
    // build mxcell by gathering level 0 fields
    let mxCell: MxCell = {
      id: _mxCell['@_id'],
      value: _mxCell['@_value'],
      edge: _mxCell['@_edge'],
      parent!: _mxCell['@_parent'],
      source!: _mxCell['@_source'],
      target!: _mxCell['@_target'],
      style!: _mxCell['@_style']
    };
    // build geometry if needed
    if (_mxCell.mxGeometry) {
      mxCell.mxGeometry = new MxGeometry()
      mxCell.mxGeometry.x = _mxCell.mxGeometry['@_x'] ? Number(_mxCell.mxGeometry['@_x']) : 0;
      mxCell.mxGeometry.y = _mxCell.mxGeometry['@_y'] ? Number(_mxCell.mxGeometry['@_y']) : 0;
      mxCell.mxGeometry.height = _mxCell.mxGeometry['@_height'] ? Number(_mxCell.mxGeometry['@_height']) : 0;
      mxCell.mxGeometry.width = _mxCell.mxGeometry['@_width'] ? Number(_mxCell.mxGeometry['@_width']) : 0;
    }
    return mxCell;
  }

}
