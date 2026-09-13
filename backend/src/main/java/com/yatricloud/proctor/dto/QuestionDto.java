package com.yatricloud.proctor.dto;

import java.util.List;

public class QuestionDto {
    private Long id;
    private String topic;
    private String difficulty;
    private String questionText;
    private List<Option> options;

    public QuestionDto() {}

    public QuestionDto(Long id, String topic, String difficulty, String questionText, List<Option> options) {
        this.id = id;
        this.topic = topic;
        this.difficulty = difficulty;
        this.questionText = questionText;
        this.options = options;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public List<Option> getOptions() { return options; }
    public void setOptions(List<Option> options) { this.options = options; }

    public static class Option {
        private String key;
        private String text;

        public Option() {}

        public Option(String key, String text) {
            this.key = key;
            this.text = text;
        }

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }
}
