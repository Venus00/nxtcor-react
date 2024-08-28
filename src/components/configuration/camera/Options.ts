export const RecordingFormatOptions = [
    { value: "opus", label: "opus" },
    { value: "aac", label: "aac" },
    { value: "pcm", label: "pcm" },
    { value: "alaw", label: "alaw" },
    { value: "ulaw", label: "ulaw" },
  ];

  export const VideoResoltionOptions = [

  
     { value :"3264x2448",  label:  "3264x2448 (8.0 MP)" },
     { value : "3072x2304", label:  "3072x2304 (7.1 MP)"},
     { value : "3000x2000", label:  "3000x2000 (6.0 MP)"},
     { value : "2560x1920", label:  "2560x1920 (4.9 MP)"},
     { value : "2448x1836", label:  "2448x1836 (4.5 MP)"},
     { value : "2048x1536", label:  "2048x1536 (3.1 MP)"},
     { value : "1920x1080", label:  "1920x1080 (2.1 MP)"},
     { value : "1600x1200", label:  "1600x1200 (1.9 MP)"},
     { value : "1280x1024", label:  "1280x1024 (1.3 MP)"},
     { value : "1280x720" , label : "1280x720      (0.9 MP)"},
     { value : "1024x768" , label : "1024x768  (0.8 MP)"},
     { value : "800x600"  , label : "800x600   (0.48 MP)"},
      
];

export const VideoEncodingOptions = [
    { value: "h264", label: "H264" },
    { value: "h265", label: "H265" },

];
export const RateControlModeOptions = [
    { value: "avbr", label: "AVBR" },
    { value: "cbr", label: "CBR" },
    { value: "vbr", label: "VBR" },

];

export const VideoProfileOptions = [
    { value: "high", label: "HIGH" },
    { value: "main", label: "MAIN" },
    { value: "base", label: "BASE" },

];

export const ImageRotationOptions = [
    { value: "0", label: "0" },
    { value: "90", label: "90" },
    { value: "270", label: "270" },

];

export const AudioSamplingRateOptions = [
    { value: "8000", label: "8000" },
    { value: "16000", label: "16000" },
    { value: "24000", label: "24000" },
    { value: "48000", label: "48000" },
];