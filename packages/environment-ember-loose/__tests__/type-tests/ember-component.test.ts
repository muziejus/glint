import Component from '@ember/component';
import {
  template,
  resolve,
  ResolveContext,
  yieldToBlock,
  emitComponent,
} from '@glint/environment-ember-loose/-private/dsl';
import { expectTypeOf } from 'expect-type';
import { EmptyObject } from '@glimmer/component/-private/component';
import type { ComponentLike } from '@glint/template';

{
  class NoArgsComponent extends Component {
    static template = template(function* (𝚪: ResolveContext<NoArgsComponent>) {
      𝚪;
    });
  }

  resolve(NoArgsComponent)({
    // @ts-expect-error: extra named arg
    foo: 'bar',
  });

  resolve(NoArgsComponent)(
    {},
    // @ts-expect-error: extra positional arg
    'oops'
  );

  {
    const component = emitComponent(resolve(NoArgsComponent)({}));

    {
      // @ts-expect-error: never yields, so shouldn't accept blocks
      component.blockParams.default;
    }
  }

  emitComponent(resolve(NoArgsComponent)({}));
}

{
  class StatefulComponent extends Component {
    private foo = 'hello';

    static template = template(function* (𝚪: ResolveContext<StatefulComponent>) {
      expectTypeOf(𝚪.this.foo).toEqualTypeOf<string>();
      expectTypeOf(𝚪.this).toEqualTypeOf<StatefulComponent>();
      expectTypeOf(𝚪.args).toEqualTypeOf<EmptyObject>();
    });
  }

  emitComponent(resolve(StatefulComponent)({}));
}

{
  interface YieldingComponentArgs<T> {
    values: Array<T>;
  }

  interface YieldingComponentSignature<T> {
    Args: YieldingComponentArgs<T>;
    Blocks: {
      default: [T];
      else: [];
    };
  }

  interface YieldingComponent<T> extends YieldingComponentArgs<T> {}
  class YieldingComponent<T> extends Component<YieldingComponentSignature<T>> {
    static template = template(function* <T>(𝚪: ResolveContext<YieldingComponent<T>>) {
      expectTypeOf(𝚪.this).toEqualTypeOf<YieldingComponent<T>>();
      expectTypeOf(𝚪.args).toEqualTypeOf<{ values: T[] }>();

      expectTypeOf(𝚪.this.values).toEqualTypeOf<Array<T>>();

      if (𝚪.args.values.length) {
        yieldToBlock(𝚪, 'default', 𝚪.args.values[0]);
      } else {
        yieldToBlock(𝚪, 'else');
      }
    });
  }

  // @ts-expect-error: missing required arg
  resolve(YieldingComponent)({});

  // @ts-expect-error: incorrect type for arg
  resolve(YieldingComponent)({ values: 'hello' });

  // @ts-expect-error: extra arg
  resolve(YieldingComponent)({ values: [1, 2, 3], oops: true });

  type InferSignature<T> = T extends Component<infer Signature> ? Signature : never;
  expectTypeOf<InferSignature<YieldingComponent<number>>>().toEqualTypeOf<
    YieldingComponentSignature<number>
  >();

  {
    const component = emitComponent(resolve(YieldingComponent)({ values: [1, 2, 3] }));

    {
      const [value] = component.blockParams.default;
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  }

  {
    const component = emitComponent(resolve(YieldingComponent)({ values: [1, 2, 3] }));

    {
      const [...args] = component.blockParams.default;
      expectTypeOf(args).toEqualTypeOf<[number]>();
    }

    {
      const [...args] = component.blockParams.else;
      expectTypeOf(args).toEqualTypeOf<[]>();
    }
  }
}

{
  interface PositionalComponentNamedArgs {
    key?: string;
  }

  interface PositionalArgsComponentSignature {
    Args: {
      Named: PositionalComponentNamedArgs;
      Positional: [name: string, age?: number];
    };
  }

  interface PositionalArgsComponent extends PositionalComponentNamedArgs {}
  class PositionalArgsComponent extends Component<PositionalArgsComponentSignature> {}

  // @ts-expect-error: missing required positional arg
  resolve(PositionalArgsComponent)({});

  resolve(PositionalArgsComponent)(
    {},
    // @ts-expect-error: incorrect type for positional arg
    123
  );

  resolve(PositionalArgsComponent)(
    {},
    'a',
    1,
    // @ts-expect-error: extra positional arg
    true
  );

  resolve(PositionalArgsComponent)({}, 'a');
  resolve(PositionalArgsComponent)({}, 'a', 1);
}

// Components are `ComponentLike`
{
  interface TestSignature {
    Args: { key: string };
    Blocks: {
      default: [value: string];
    };
    Element: HTMLDivElement;
  }

  class TestComponent extends Component<TestSignature> {}

  expectTypeOf(TestComponent).toMatchTypeOf<ComponentLike<TestSignature>>();
}
