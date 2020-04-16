import React, { Component } from 'react';
import './AudioWaveformVisualizer.css';
import AudioSource from '../../audio/AudioSource';
import AudioSink from '../../audio/AudioSink';

export interface AudioWaveformVisualizerOptions {
  w: number,
  h: number,
  tickWidth: number
}

export interface AudioWaveformVisualizerProps {
  options?: AudioWaveformVisualizerOptions;
  audioDataSource: AudioSource | AudioSink;
}

export interface AudioWaveformVisualizerState {

}

export default class AudioWaveformVisualizer extends React.Component<AudioWaveformVisualizerProps, AudioWaveformVisualizerState> {

  private _canvasId: string = 'waveform_viz';
  private _vizualizerCanvas: HTMLCanvasElement | null = null;
  private _vizualizerContext: CanvasRenderingContext2D | null = null;
  private _vizOptions: AudioWaveformVisualizerOptions;
  private _vizColumn: number;
  private _resetNeeded: boolean;
  private _onAudioVolumeHandler: any = this.onAudioVolume.bind(this);
  private _animationFrameRequest: number;

  constructor(props: AudioWaveformVisualizerProps) {
    super(props);
    this._vizOptions = {
      w: 256,
      h: 256,
      tickWidth: 1
    };
    this._vizColumn = 0;
    if (this.props.options) {
      this._vizOptions = this.props.options;
    }
    this._resetNeeded = false;
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
    }
  }

  onAudioVolume(volume: number) {
    // console.log(`AudioWaveformVisualizer: onAudioVolume:`, volume);
    this.drawCanvas(volume);
  }

  onButtonClicked(action: string, event: any) {
    // console.log(`onButtonClicked: ${action}`);
    event.preventDefault();

    switch(action) {
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
      const h = this._vizOptions.h;
      // Drawing the Time Domain onto the Canvas element
      let min = 999999;
      let max = 0;

      const val = (volume / 100);
      max = val;
      min = -max;

      const yLow = h / 2 - h * min;
      const yHigh = h / 2 + h * min;
      if (this._vizualizerContext) {
        this._vizualizerContext.fillStyle = '#ffffff'; //'#1A6B96';
        this._vizualizerContext.fillRect(this._vizColumn, yLow, this._vizOptions.tickWidth, yHigh - yLow);
        this._vizColumn += 1;
        if (this._vizColumn >= this._vizOptions.w) {
          this._vizColumn = 0;
          this.clearCanvas();
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