import React, { Component } from 'react';
import { AudioSource, AudioSink } from 'cognitiveserviceslib';

import './AudioEqVisualizer.css';

export interface AudioWaveformVisualizerOptions {
  w: number,
  h: number,
  tickWidth: number
}

export interface AudioWaveformVisualizerProps {
  options?: AudioWaveformVisualizerOptions;
  audioDataSource: AudioSource | AudioSink | undefined;
}

export interface AudioWaveformVisualizerState {

}

export default class AudioEqVisualizer extends React.Component<AudioWaveformVisualizerProps, AudioWaveformVisualizerState> {

  private _canvasId: string = 'eq_viz';
  private _vizualizerCanvas: HTMLCanvasElement | null = null;
  private _vizualizerContext: CanvasRenderingContext2D | null = null;
  private _vizOptions: AudioWaveformVisualizerOptions;
  private _vizColumn: number;
  private _resetNeeded: boolean;
  private _onAudioVolumeHandler: any = this.onAudioVolume.bind(this);
  private _colors: string[];
  private _colorsOn: boolean = true;
  private _canvasIsCleared: boolean = true;
  private _animationFrameRequest: number;

  constructor(props: AudioWaveformVisualizerProps) {
    super(props);
    this._vizOptions = {
      w: 256,
      h: 256,
      tickWidth: 0.5
    };
    this._vizColumn = 0;
    if (this.props.options) {
      this._vizOptions = this.props.options;
    }
    this._resetNeeded = false;

    this._colors = [
      '#00b6f0',
      // '#3BEF71',
      // '#F48422',
      // '#F24FCF',
      // '#FFEA32',
      // '#00b6f0',
      // '#3BEF71',
      // '#F48422',
      // '#F24FCF',
      // '#FFEA32'
    ];
  }

  componentDidMount() {
    this._vizualizerCanvas = document.getElementById(this._canvasId) as HTMLCanvasElement;
    this._vizualizerContext = this._vizualizerCanvas.getContext('2d');
  }

  componentWillUnmount() {
    if (this.props.audioDataSource) {
      this.props.audioDataSource.off('volume', this._onAudioVolumeHandler);
    }
  }

  componentWillReceiveProps(nextProps: AudioWaveformVisualizerProps) {
    // console.log(`AudioWaveformVisualizerProps: componentWillReceiveProps`, nextProps.audioDataSource);
    // console.log(nextProps);
    if (nextProps.audioDataSource != this.props.audioDataSource) {
      cancelAnimationFrame(this._animationFrameRequest);
      if (this.props.audioDataSource) {
        this.props.audioDataSource.off('volume', this._onAudioVolumeHandler);
      }
      if (nextProps.audioDataSource) {
        nextProps.audioDataSource.on('volume', this._onAudioVolumeHandler);
      }
      this._resetNeeded = true;
      this.clearCanvas();
    }
  }

  onAudioVolume(volume: number) {
    // console.log(`AudioEqVisualizer: onAudioVolume:`, volume);
    this.drawCanvas(volume);
  }

  onButtonClicked(action: string, event: any) {
    // console.log(`onButtonClicked: ${action}`);
    event.preventDefault();

    switch (action) {
      case 'btnClear':
        this.clearCanvas();
        break;
    }
  }

  clearCanvas() {
    const w = this._vizOptions.w;
    let h = this._vizOptions.h;
    if (this._vizualizerContext) {
      this._vizualizerContext.clearRect(0, 0, w, h); // TODO: pull out height/width
      // this._vizualizerContext.strokeStyle = '#333';
      // const y = (h / 2) + 0.5;
      // this._vizualizerContext.moveTo(0, y);
      // this._vizualizerContext.lineTo(w - 1, y);
      // this._vizualizerContext.stroke();
      this._vizColumn = 0;
    }
  }

  drawCanvas(volume: number) {
    this._animationFrameRequest = requestAnimationFrame(() => {
      if (this._resetNeeded) {
        this.clearCanvas();
        this._resetNeeded = false;
      }
      let max_data_value = 0;
      if (this._vizualizerContext) {
        this._vizualizerContext.fillStyle = '#1A6B96';
        this._vizualizerContext.clearRect(0, 0, this._vizOptions.w, this._vizOptions.h);
        if (this.props.audioDataSource) {
          const data = new Uint8Array(this.props.audioDataSource.analyzerSamples);
          this.props.audioDataSource.analyzer.getByteFrequencyData(data);

          this._vizualizerContext.fillStyle = '#00b6f0';

          const length = data.length / 2;
          const bar_width = Math.floor((this._vizOptions.w / length) / 3);
          const mid_point = Math.floor(this._vizOptions.w / 2);
          for (var i = 0; i < length; i++) {
            const value = data[i];
            let top = this._vizOptions.h - Math.floor((this._vizOptions.h * (value * 1.0) / 256.0));
            const left1 = mid_point + i * bar_width;
            const left2 = mid_point - i * bar_width;
            const width = bar_width - 1;
            const height = this._vizOptions.h - top;

            top = Math.floor(top / 2);

            max_data_value = Math.max(max_data_value, value);

            if (this._colorsOn) {
              const div = data.length / this._colors.length;
              const colorIndex = Math.floor(i / div);
              this._vizualizerContext.fillStyle = this._colors[colorIndex];
            }
            this._vizualizerContext.fillRect(left1, top, bar_width - 1, height);
            this._vizualizerContext.fillRect(left2, top, bar_width - 1, height);
            this._canvasIsCleared = false;
          }
        }
      }
    });
  }

  render() {
    let canvasStyle: any = { borderColor: 'white' };
    return (
      <div className="Visualizer">
        <canvas id={this._canvasId} height={this._vizOptions.h} width={this._vizOptions.w} style={canvasStyle}></canvas>
        {/* <button id='btnClear' type='button' className={`btn btn-primary App-button`}
          onClick={(event) => this.onButtonClicked(`btnClear`, event)}>
          Clear
          </button> */}
      </div>
    );
  }
}