const SubComponent = () => null;
const InternalComponent = () => null;
const Component = () => <SubComponent />;

const Root = () => <Component> <InternalComponent /> </Component>;

Root();
