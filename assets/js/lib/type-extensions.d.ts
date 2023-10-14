type NavigatorUAData = {
  mobile: boolean;
  platform: string;
};

interface Navigator {
  userAgentData?: NavigatorUAData;
}
