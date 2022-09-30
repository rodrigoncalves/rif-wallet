import * as React from 'react'
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Path,
  SvgProps,
} from 'react-native-svg'

const ActivitySelectedIcon = (props: SvgProps) => (
  <Svg width={30} height={27} fill="none" {...props}>
    <Circle
      cx={15.137}
      cy={13.405}
      r={11.543}
      transform="rotate(-105 15.137 13.405)"
      fill="#DBE3FF"
    />
    <G clipPath="url(#a)">
      <Path
        d="m15.6 7.944-.332.332-5.357 5.357c-.093.093-.186.25-.289.257-.224.018-.539.038-.657-.09-.115-.125-.055-.437-.024-.66.014-.093.153-.17.236-.252l5.356-5.357.329-.328-.033-.13c-.71.017-1.422.035-2.132.05-.147.003-.293-.004-.44.002-.37.015-.647-.1-.675-.514-.023-.344.231-.535.696-.536 1.203-.005 2.406-.004 3.608-.005.103 0 .206-.004.308.002.353.017.541.208.542.558.003 1.35.001 2.699-.005 4.048-.002.327-.174.54-.505.547-.355.008-.539-.207-.539-.556 0-.894.01-1.788.015-2.682l-.102-.043Z"
        fill="#00031F"
      />
    </G>
    <G clipPath="url(#b)">
      <Path
        d="m14.065 18.789.333-.333 5.356-5.356c.093-.094.186-.25.29-.258.223-.018.538-.038.657.09.115.125.055.437.023.66-.013.093-.152.17-.235.253L15.132 19.2l-.328.329.032.129 2.133-.05c.146-.003.293.004.44-.002.37-.015.646.1.675.514.023.345-.232.535-.697.537-1.203.004-2.405.003-3.608.004-.102 0-.205.004-.307-.002-.353-.017-.542-.207-.543-.558-.002-1.35 0-2.698.005-4.047.002-.328.175-.54.506-.547.354-.008.538.207.538.556 0 .893-.009 1.787-.014 2.681l.102.043Z"
        fill="#00031F"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path
          fill="#fff"
          transform="rotate(45 5.186 12.521)"
          d="M0 0h17.603v14.669H0z"
        />
      </ClipPath>
      <ClipPath id="b">
        <Path
          fill="#fff"
          transform="rotate(-135 15.183 9.37)"
          d="M0 0h17.603v14.669H0z"
        />
      </ClipPath>
    </Defs>
  </Svg>
)

export default ActivitySelectedIcon