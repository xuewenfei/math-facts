'use strict';

import _ from 'underscore';

import React from 'react-native';
const {
  StyleSheet,
  Text,
  View,
} = React;

import Animated from '../core-components/Animated';

import { AppText, AppTextBold } from './AppText';

import ColorHelpers from '../helpers/color-helpers';
import Icon from '../components/Icon';
import MasteryHelpers from '../helpers/mastery-helpers';
import OperationHelpers from '../helpers/operation-helpers';
import Helpers from '../helpers/helpers';
import SH from '../helpers/style-helpers';
import { lineHeightUnits } from '../helpers/helpers';

import NumPad from '../components/NumPad';
import Button from '../components/Button';
import Circle from '../components/Circle';

import BackButton from '../components/BackButton';

const QuizzerScreen = React.createClass({
  propTypes: {
    back: React.PropTypes.func.isRequired,
    color: React.PropTypes.arrayOf(React.PropTypes.number),
    points: React.PropTypes.number,
    timeBonus: React.PropTypes.number,
  },
  render: function() {
    const {
      color,
      points,
      timeBonus,
      children,
    } = this.props;
    const rgb = color;
    const mainColor = ColorHelpers.printRgb(rgb);

    return (
      <View style={[styles.container, {backgroundColor: mainColor}]}>
        <View style={styles.topRow}>
          <BackButton onPress={this.props.back} />
          {points != null && <View style={styles.points}>
            {timeBonus > 1 && Helpers.Platform.OS !== "web" &&
              <TimeBonus key={points} points={timeBonus} />
            }
            <AppText style={styles.pointsText}>
              <AppTextBold style={styles.pointsTextBold}>
                {points}
              </AppTextBold> points
            </AppText>
          </View>}
        </View>
        {children}
      </View>
    );
  },
});


const TimeBonus = React.createClass({
  propTypes: {
    points: React.PropTypes.number,
  },
  getInitialState: function() {
    return {
      anim: new Animated.Value(0),
    };
  },
  componentDidMount: function() {
    Animated.sequence([
      Animated.timing(this.state.anim, {toValue: 1, duration: 300}),
      Animated.delay(800),
      Animated.timing(this.state.anim, {toValue: 2, duration: 400}),
    ]).start();
  },
  render: function() {
    const { points } = this.props;
    const backgroundOpacity = points > 10 ? 0.4 : 0.2;
    const y = this.state.anim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [10, 0, -10],
    });
    const opacity = this.state.anim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, 0],
    });
    return <View>
      <Animated.View
        style={[styles.timeBonus, {
          flex: 1,
          transform: [{
            translateY: y,
          }],
          opacity: opacity,
          backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
        }]}>
          <AppText style={styles.timeBonusText}>
            Fast! +{points}
          </AppText>
      </Animated.View>
    </View>;
  },
});


const Loading = React.createClass({
  propTypes: {
    back: React.PropTypes.func.isRequired,
    color: React.PropTypes.arrayOf(React.PropTypes.number),
  },
  render: function() {
    const {
      back,
      color,
    } = this.props;
    return (
      <QuizzerScreen color={color} back={back}>
        <View style={styles.loading}>
          <AppText style={styles.loadingText}>
            Loading...
          </AppText>
        </View>
      </QuizzerScreen>
    );
  },
});


const Countdown = React.createClass({
  propTypes: {
    back: React.PropTypes.func.isRequired,
    color: React.PropTypes.arrayOf(React.PropTypes.number),
    countdown: React.PropTypes.number.isRequired,
    ProgressComponent: React.PropTypes.node.isRequired,
  },
  render: function() {
    const {
      back,
      color,
      countdown,
      ProgressComponent,
    } = this.props;
    return (
      <QuizzerScreen color={color} back={back}>
        {ProgressComponent}
        <View style={styles.countdown}>
          <AppText style={styles.countdownText}>
            {countdown > 0 ? 'Ready?' : 'GO!'}
          </AppText>
        </View>
      </QuizzerScreen>
    );
  },
});

const ProgressBar = React.createClass({
  propTypes: {
    color: React.PropTypes.string.isRequired,
    elapsedTime: React.PropTypes.number.isRequired,
    totalTime: React.PropTypes.number.isRequired,
  },
  render: function() {
    const {
      color,
      elapsedTime,
      totalTime,
    } = this.props;

    const hslColor = ColorHelpers.rgbToHsl(ColorHelpers.hexToRgb(color));
    hslColor[2] *= 1.2;
    const lighterColor = ColorHelpers.printRgb(
      ColorHelpers.hslToRgb(hslColor)
    );

    const done = elapsedTime === totalTime;

    return (
      <View style={styles.progressBar}>
        <View style={[styles.progressBarSegment, {
          flex: elapsedTime / totalTime,
          backgroundColor: "#fff",
        }]} />
        <View style={[
            styles.progressBarSegment,
            {
              flex: 1 - elapsedTime / totalTime,
              backgroundColor: lighterColor,
            }
        ]}/>
        <View style={styles.progressBarClock}>
          <Icon
            type="clock"
            scale={1.3}
            size={30}
            color={done ? lighterColor : "#fff"}
            backgroundColor={done ? "#fff" : lighterColor}
            backgroundType="circle"
          />
        </View>
      </View>
    );
  },
});

const Summary = React.createClass({
  propTypes: {
    color: React.PropTypes.arrayOf(React.PropTypes.number),
    count: React.PropTypes.number.isRequired,
    finish: React.PropTypes.func.isRequired,
    mode: React.PropTypes.string.isRequired,
    playAgain: React.PropTypes.func.isRequired,
    points: React.PropTypes.number.isRequired,
    ProgressComponent: React.PropTypes.node.isRequired,
  },
  render: function() {
    const {
      color,
      count,
      finish,
      mode,
      playAgain,
      points,
      ProgressComponent,
    } = this.props;

    return (
      <QuizzerScreen
          color={color}
          back={finish}>
        {ProgressComponent}
        <View style={styles.summary}>
          <AppText style={styles.summaryTitle}>
            {mode === 'time' ? 'Time\'s up!' : 'You\'re done!'}
          </AppText>
          <AppText style={styles.summaryText}>
            {'You earned '}
          </AppText>
          <AppTextBold style={styles.summaryPoints}>
            {points}
          </AppTextBold>
          <AppText style={styles.summaryText}>
            {' points!'}
          </AppText>

          <AppText style={styles.summaryCountText}>
            <AppText>
              {'You answered '}
            </AppText>
            <AppTextBold>
              {count}
            </AppTextBold>
            <AppText>
              {' questions!'}
            </AppText>
          </AppText>
        </View>
        <Button
          text='Play Again!'
          style={styles.summaryButton}
          styleText={styles.summaryButtonText}
          onPress={playAgain}/>
        <Button
          text='Back'
          style={styles.summaryButton}
          onPress={finish}/>
      </QuizzerScreen>
    );
  },
});


const Game = React.createClass({
  propTypes: {
    addDigit: React.PropTypes.func.isRequired,
    answer: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string,
    ]).isRequired,
    back: React.PropTypes.func.isRequired,
    bounce: React.PropTypes.func,
    clear: React.PropTypes.func.isRequired,
    color: React.PropTypes.arrayOf(React.PropTypes.number),
    digitBounceValue: React.PropTypes.object.isRequired,
    hint: React.PropTypes.func.isRequired,
    hintUsed: React.PropTypes.bool.isRequired,
    newQuestionBounceValue: React.PropTypes.object.isRequired,
    operation: React.PropTypes.string.isRequired,
    points: React.PropTypes.number.isRequired,
    ProgressComponent: React.PropTypes.node.isRequired,
    question: React.PropTypes.string.isRequired,
    response: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string,
    ]).isRequired,
    timeBonus: React.PropTypes.number,
  },
  componentDidMount: function() {
    if (this.props.bounce) {
      this.props.bounce();
    }
  },
  render: function() {
    const {
      addDigit,
      answer,
      back,
      clear,
      color,
      digitBounceValue,
      hint,
      hintUsed,
      newQuestionBounceValue,
      operation,
      points,
      ProgressComponent,
      question,
      response,
      timeBonus,
    } = this.props;

    return (
      <QuizzerScreen
          color={color}
          points={points}
          back={back}
          timeBonus={timeBonus}
        >

        {ProgressComponent}

        <Animated.View
          style={[styles.questionContainer, {
            flex: 1,
            transform: [
              {scale: newQuestionBounceValue},
            ],
          }]}>
          <AppText style={styles.question}>
            {question}
          </AppText>
        </Animated.View>

        <Animated.View
          style={[styles.responseContainer, {
            flex: 1,
            transform: [
              {scale: digitBounceValue},
            ],
          }]}
        >
          <AppText style={[styles.response]}>
            {response}
          </AppText>
        </Animated.View>

        <View style={styles.hintContainer}>
          {hintUsed &&
            <AppText style={styles.hintText}>
              The answer is <AppTextBold>{answer}</AppTextBold>
            </AppText>
          }
        </View>

        <NumPad
          operation={operation}
          addDigit={addDigit}
          hint={hint}
          clear={clear}/>

      </QuizzerScreen>
    );
  },
});

const Quizzer = React.createClass({
  propTypes: {

  },
  getInitialState: function() {
    return {
      inputList: [],
      loaded: false,

      studyFact: [],
      spacer: 1,

      countdown: 1,

      count: 0,
      hintUsed: false,
      data: [],
      response: '',
      colorHue: 0,
      points: 0,
      totalTimeElapsed: 0, // in seconds

      correctAnswer: false,

      digitBounceValue: new Animated.Value(1),
      newQuestionBounceValue: new Animated.Value(1),

      timeBonus: 0,
    };
  },
  time: 0, // in ms

  getInputs: function() {
    // Get the next question's inputs
    return this.state.inputList[this.state.count];
  },
  addDigit: function(value) {
    if (this.state.correctAnswer) {
      return;
    }
    if (this.state.response.toString().length < 3) {
      const intResponse = parseInt(this.state.response + value.toString());
      this.setState({
        response: intResponse
      }, this.check);
    } else {
      // Visual feedback that you're at the max number of digits
      this.state.digitBounceValue.setValue(0.9);
      Animated.spring(
        this.state.digitBounceValue,
        {
          toValue: 1,
          friction: 3,
        }
      ).start();
    }
  },
  clear: function() {
    this.setState({
      response: ''
    });
  },
  hint: function() {
    this.setState({
      hintUsed: true
    });
  },
  addToInputList: function(quizzesData) {
    const ret = MasteryHelpers.addToInputList(
      this.props.operation,
      quizzesData,
      this.state.inputList,
      this.props.timeData,
      this.state.studyFact,
      this.state.spacer
    );

    this.setState({
      spacer: ret.spacer
    });
    return ret.inputList;
  },
  initializeInputList: function(quizzesData) {
    const inputList = this.addToInputList(quizzesData);

    this.setState({
      inputList: inputList,
      loaded: true
    }, () => {
      this.interval = setInterval(this.countdown, 1000);
    });
  },
  componentDidMount: function() {
    if (this.props.quizzesData != null) {
      this.initializeInputList(this.props.quizzesData);
    }
  },
  componentWillReceiveProps: function(newProps) {
    const oldQuizzesData = this.props.quizzesData;

    if (oldQuizzesData == null && newProps.quizzesData != null) {
      this.initializeInputList(newProps.quizzesData);
    }
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  tick: function() {
    this.time += 50;
    if (this.time % 1000 === 0) {
      this.setState({
        totalTimeElapsed: this.state.totalTimeElapsed + 1
      });
    }
  },
  countdown: function() {
    const countdown = this.state.countdown;

    if (countdown < 0) {
      clearInterval(this.interval);
      this.interval = setInterval(this.tick, 50);
    }

    this.setState({
      countdown: countdown - 1
    });
  },
  questionBounce: function() {
      this.state.newQuestionBounceValue.setValue(0.92);
      Animated.spring(
        this.state.newQuestionBounceValue,
        {
          toValue: 1,
          friction: 4,
        }
      ).start();
  },
  check: function() {
    const inputs = this.getInputs();
    const operation = this.props.operation;
    const OperationHelper = OperationHelpers[operation];
    const answer = OperationHelper.getAnswer(inputs);

    if (parseInt(this.state.response) === parseInt(answer)) {
      // They have entered the correct answer
      this.setState({
        correctAnswer: true,
      });

      const time = this.time;
      const hintUsed = this.state.hintUsed;
      let inputList = this.state.inputList.slice();

      const learnerTypingTimes = MasteryHelpers.getLearnerTypingTimes(
        this.props.timeData,
        operation,
      );

      const timeBonus = MasteryHelpers.getTimeBonus(
        time,
        answer,
        learnerTypingTimes,
        hintUsed,
      );
      const newPoints = this.state.points + timeBonus;

      // Delay logic so user has a chance to see the digit they just entered
      setTimeout(() => {
        const d = new Date();
        const data = [
          ...this.state.data,
          {
            inputs: inputs,
            data: {
              time: time, // time taken in ms
              hintUsed: hintUsed,
              date: d.getTime(),
            }
          },
        ];

        const timeUp = this.state.totalTimeElapsed > this.props.seconds;
        const finished = this.props.mode === 'time' ? timeUp :
                       (this.state.count >= this.props.count - 1);
        if (finished) {
          // Finished the quiz
          clearInterval(this.interval);
        }

        // If we're near the end of the input list, add more questions to it
        const questionsRemaining = inputList.length - (this.state.count + 1);
        if (questionsRemaining <= 2) {
          inputList = this.addToInputList(this.props.quizzesData);
        }

        // Visual feedback that you're getting a new question
        // todo move this somewhere else so that it can animate the first Q too
        this.questionBounce();

        // Load a new question
        this.setState({
          correctAnswer: false,
          inputList: inputList,

          count: this.state.count + 1,
          hintUsed: false,
          data: data,
          response: '',
          colorHue: this.state.colorHue + 1,
          points: newPoints,
          finished: finished,

          timeBonus: timeBonus,
        });
        this.time = 0;
      }, 150);
    }
  },

  getColor: function() {
    const colors = ColorHelpers.backgroundColors;
    return colors[this.state.colorHue % colors.length];
  },

  _renderProgressBar: function() {
    let elapsedSeconds = this.state.totalTimeElapsed;
    const totalSeconds = this.props.seconds;
    if (elapsedSeconds > totalSeconds) {
      elapsedSeconds = totalSeconds;
    }
    return <View>
        <ProgressBar
          color={ColorHelpers.rgbToHex(this.getColor())}
          elapsedTime={elapsedSeconds}
          totalTime={totalSeconds}
        />
    </View>;
  },

  _renderProgressDots: function() {
    return (
      <View>
        <View style={styles.progressDots}>
          {_.map(_.range(0, this.props.count), (value) => {
            const opacity = value < this.state.count ? 1 : 0.2;
            const color = 'rgba(255, 255, 255, ' + opacity + ')';
            return (
              <Circle
                key={'notch-' + value}
                size={7}
                color={color}>
              </Circle>
            );
          })
        }
        </View>
      </View>
    );
  },

  _renderProgress: function() {
    return this.props.mode === 'time' ? this._renderProgressBar() :
                                        this._renderProgressDots();
  },

  render: function() {
    if (!this.state.loaded) {
      return <Loading
        back={this.props.back}
        color={this.getColor()}
      />;
    }

    if (this.state.countdown >= 0) {
      return <Countdown
        back={this.props.back}
        color={this.getColor()}
        countdown={this.state.countdown}
        ProgressComponent={this._renderProgress()}
      />;
    }

    if (!this.state.finished) {
      const OperationHelper = OperationHelpers[this.props.operation];

      const inputs = this.getInputs();
      const answer = OperationHelper.getAnswer(inputs);
      const question = OperationHelper.getQuestion(inputs);

      return <Game
        addDigit={this.addDigit}
        answer={answer}
        back={this.props.back}
        bounce={this.questionBounce}
        clear={this.clear}
        color={this.getColor()}
        digitBounceValue={this.state.digitBounceValue}
        hint={this.hint}
        hintUsed={this.state.hintUsed}
        newQuestionBounceValue={this.state.newQuestionBounceValue}
        operation={this.props.operation}
        points={this.state.points}
        ProgressComponent={this._renderProgress()}
        question={question}
        response={this.state.response}
        timeBonus={this.state.timeBonus}
      />;
    }

    return <Summary
      color={this.getColor()}
      count={this.state.count}
      finish={() => {
        this.props.finish(this.state.data, this.state.points);
      }}
      mode={this.props.mode}
      playAgain={() => {
        this.props.playAgain(this.state.data, this.state.points);
      }}
      points={this.state.points}
      ProgressComponent={this._renderProgress()}
    />;
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SH.colors.backgroundColor,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0, 0, 0, 0.15)'
  },

  points: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingRight: 20,
    paddingTop: 18,
  },
  pointsText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pointsTextBold: {
    color: SH.colors.white,
  },

  progressBar: {
    flexDirection: 'row',
    alignSelf: 'stretch'
  },
  progressBarSegment: {
    height: 7
  },

  progressBarClock: {
    backgroundColor: "transparent",
    marginTop: -10,
    marginLeft: -2,
  },

  progressDots: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    margin: 10
  },

  timeBonus: {
    alignItems: 'flex-start',
    borderRadius: 3,
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
    paddingBottom: 2,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 2,
  },
  timeBonusText: {
    color: '#fff',
  },

  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 85,
  },
  question: {
    color: SH.colors.white,
    fontSize: 50,
  },
  responseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  response: {
    fontSize: 75,
    height: 100,
    color: SH.colors.white,
    marginBottom: 20,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30
  },
  loadingText: {
    fontSize: 30,
    color: SH.colors.white,
  },

  countdown: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30
  },
  countdownText: {
    fontSize: 60,
    color: SH.colors.white,
  },

  summary: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  summaryTitle: {
    fontSize: 50,
    marginBottom: 20,
    color: SH.colors.white,
  },
  summaryText: {
    fontSize: 25,
    color: SH.colors.white,
  },
  summaryCountText: {
    fontSize: 20,
    color: SH.colors.white,
    marginTop: 20,
  },
  summaryPoints: {
    fontSize: 40,
    color: SH.colors.white,
    lineHeight: lineHeightUnits(70),
  },
  summaryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    padding: 20,
  },
  summaryButtonText: {
    fontSize: 25,
  },

  hintContainer: {
    alignItems: 'center',
    height: 30,
    marginBottom: 5,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 22,
  },
});

module.exports = Quizzer;
