import {
  ITdLabel,
  ITdItemStyle,
} from '../base';

/**
 * ECHART OPTION DOCS
 * https://ecomfe.github.io/echarts-doc/public/en/option.html#series-tree
 *
 */

/** 
 * LR - from left to right
 * RL - from right to left
 * TB - from top to bottom
 * BT - from bottom to top
 */
type TdOrient = 'LR' | 'RL'| 'TB' | 'BT';

interface ITdTreeLineStyle {
  color?: any;
  width?: number;
  shadowBlur?: number;
  shadowColor?: any;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  curveness?: number;
}

interface ITdTreeEmphasis {
  label?: ITdLabel;
  itemStyle?: ITdItemStyle;
  lineStyle: ITdTreeLineStyle;
}

interface ITdTreeLeaves {
  label?: ITdLabel;
  itemStyle?: ITdItemStyle;
  emphasis: { label: ITdLabel, itemStyle: ITdItemStyle };
}

export { TdOrient, ITdTreeLineStyle, ITdTreeEmphasis, ITdTreeLeaves };
